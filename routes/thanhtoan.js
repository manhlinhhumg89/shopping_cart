const { db, } = require('../pgp');

const Product = require('../models/list_book');
const shortid = require('shortid')
const product = new Product(db)
module.exports = function (express,cart) {

    const router = express.Router();
    router.post('/',(req,res) =>{
        let id_usert = req.cookies['cart'];
        let cart = req.session.cart;
        let ids = '';
        let count =0;
        for(item in cart) {
            count++;
            if(count===1){
                ids += "'" + item + "'";
            } else {
                ids += ",'" + item +"'"
            }
        }
        let countCart = Object.keys(cart).length;
        db.task(t=>{
            return t.batch([
                product.cartID(ids),
                cart
            ])
        })
            .then(data =>{
                let total =0;
                var data_order;
                let allProducts =data[0]; // se la 1 mang doi tuong co cac truong {id,name,price}
                let cart = data[1]; // ket qua tra ve la 1 object trong do co cac truong {id book,soluong}
                allProducts.forEach((item) =>{
                    total += (item.price * cart[item.id]) //==> tinh tong tien cua tat cac quyen sach
                })
                //res.json(req.session.user) // du lieu duoc lay khi dang nhap xong bang passport o trang user
                //res.jsonp(total)

                if(req.body['thanhtoan']){
                    if(req.body['name'] && req.body['phone'] && req.body['email'] && req.body['address'] && req.body['method']){
                        let order_id = shortid.generate();
                        let user_id = null;
                        if(req.session.user.user_id) {
                            user_id = req.session.user.user_id
                        }

                        data_order ={
                            id: order_id,
                            user_id: user_id,
                            name: req.body['name'],
                            phone: req.body['phone'],
                            email: req.body['email'],
                            address: req.body['address'],
                            method: req.body['method'],
                            note: req.body['note'],
                            status: 'pending',
                            delivery_date: '0000-00-00 00:00:00',
                            quantity: req.session.total,
                            total: total
                        }
                        // chen du lieu vao bang orders
                        let allproductArr=[]
                        db.any("INSERT INTO orders(orders_id, user_id, name, phone, email, address, note, total, payment_id, order_date, delivery_date, quantity) " +
                            "VALUES(${id},${user_id},${name},${phone},${email},${address},${note}, ${total}, ${method}, (select localtimestamp(0)), ${delivery_date}, ${quantity}) RETURNING *",data_order)
                            .then(data =>{
                                order_data =data[0];
                                // data tra ve co dang nhu ben duoi
                                // {
                                //     "orders_id": "HJyVJqo6W",
                                //     "user_id": 1,
                                //     "name": "Dao Manh Linh",
                                //     "phone": "0946076717",
                                //     "email": "manhlinh1985@gmail.com",
                                //     "address": "fehrhaha",
                                //     "note": "ssssssss",
                                //     "total": 104,
                                //     "payment_id": "bank",
                                //     "order_date": "2017-10-22T17:00:00.000Z",
                                //     "delivery_date": "0000-00-00 00:00:00",
                                //     "quantity": 3
                                // }
                                allProducts.forEach(item =>{
                                    let id = shortid.generate();
                                    let eachProduct = {
                                        detailed_order_id: id,
                                        order_id: data[0].orders_id,
                                        product_id: item.id,
                                        product_name: item.name,
                                        price: item.price,
                                        quantity: cart[item.id],
                                        user_id: user_id
                                    };
                                    allproductArr.push(eachProduct);
                                    db.none("INSERT INTO detailed_orders(detailed_orders_id,orders_id,product_id,product_name,quantity,price,user_id)" +
                                        "VALUES(${detailed_order_id},${order_id},${product_id},${product_name},${quantity},${price},${user_id})",eachProduct)
                                        .then(() =>{
                                        console.log('insert thanh cong');
                                        //res.redirect(req.header("referrer"))
                                        })
                                        .catch(err =>{
                                            console.log(err)
                                        })
                                })

                            })
                            .then(data =>{
                                res.render('thanh-cong.html',{
                                    title:'Thanh toan thanh cong',
                                    login: req.session.login,
                                    user: req.session.user,
                                    user_id : req.session.user.user_id,
                                    total : total
                                })
                            })
                            .catch(err=>{
                                console.log(err)
                            })

                    }

                }
            })

    })


    return router
}