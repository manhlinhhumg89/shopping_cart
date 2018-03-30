
const {db, } = require('../pgp');
const shortid = require('shortid');
const Product = require('../models/list_book');
const Detail = require('../models/detail')

const product = new Product(db);
const detail = new Detail(db);

module.exports = function (express) {
    const router = express.Router();

    // Xay dung router gio hang
    router.get('/addtocart/:id',(req,res) =>{
        let q = req.params.id;
        let id_user = req.cookies['cart']

        //res.json(id_user)
        if(req.session.cart[q]){
            let qty = parseInt(req.session.cart[q]);
            req.session.cart[q] = qty +1;
            console.log('gia tri cart q='+req.session.cart[q]);
            let cart_insert = {
                cart_id:shortid.generate(),
                session_user_id: id_user,
                product_id: q,
                qty: qty+1
            };
            //res.json(cart_insert)
            db.none('UPDATE carts SET qty=${qty} WHERE session_user_id =${session_user_id} AND product_id = ${product_id} ',cart_insert)
                .then(()=>{
                    console.log('Update success');
                    res.redirect(req.header('referrer'))
                })
                .catch(error =>{
                    res.json({
                        success: false,
                        error: error.message || error
                    })
                })
        }else{
            req.session.cart[q] =1;
            //console.log('gia tri cua q:' + req.session.cart[q])
            let cart_insert ={
                cart_id: shortid.generate(),
                session_user_id: id_user,
                product_id: q,
                qty: 1
            }
            //res.json(cart_insert)
            db.none('INSERT INTO carts(cart_id,session_user_id,product_id,qty) VALUES (${cart_id},${session_user_id},${product_id},${qty} )',cart_insert)
                .then(() =>{
                    console.log('Insert success');
                    console.log(req.header('referrer'))
                    res.redirect(req.header('referrer'))
                })
                .catch(error =>{
                    res.json({
                        success: false,
                        error: error.message || error
                    })
                })
        }

    })

    router.get('/',(req,res) =>{
        //Lay gia tri session cart
        let cart = req.session.cart;
        //res.json(cart)
        let id_p ='';
        let count = 0;
        for(item in cart) {
            count++;
            if(count ===1){
                id_p += "'" + item +"'";
            } else {
                id_p += ",'" +item + "'"
            }
        }
        //res.json(id_p)
        // Dem so san pham co trong cart
        let count_ = 0;
        if(cart) {
            count_ = Object.keys(cart).length;
        }
        //res.json(cart)
        if(!cart || count_===0) {
            res.render('gio-hang.html',{
                title: 'Trang gio hang',
                product:'',
                cart:''
            })
        } else {

            db.task(t=>{
                return t.batch([
                    product.cartID(id_p),
                    cart
                ])
            })
                .then(data =>{
                    let total =0;
                    data[0].forEach(eachProduct =>{
                        eachProduct.total = data[1][eachProduct.id] * eachProduct.price;
                        total += eachProduct.total;
                    })
                    res.render('gio-hang.html',{
                        title:'Gio hang',
                        product: data[0],
                        cart: data[1],
                        total: total,
                        login: req.session.login,
                        user: req.session.user


                    })
                })
                .catch(error =>{
                    res.json({
                        success: false,
                        error: error.message || error
                    })
                })
        }

    })

router.post('/',(req,res) =>{
    let id_user = req.cookies['cart'];
    let cart = req.session.cart;
    let ids =''
    let count =0;
    if(req.body['capnhat']){
        for(item in cart) { // vong lap chay trong object
            if(req.body[item] >0) {// gia tri req.body[item] o day > la chua bi xoa
                cart[item] = req.body[item];// gan gia tri so luong cho thuoc tinh cart[item]
                qty = req.body[item]; // gan gia tri qty sau neu co thay doi o input
                // tien hanh update gia tri
                let cart_insert = {
                    session_user_id: id_user,
                    product_id: item,
                    qty: qty
                };
               // chen vao co so du lieu
                db.none('UPDATE carts SET qty=${qty} WHERE session_user_id = ${session_user_id} AND product_id=${product_id}',cart_insert)
                    .then(() =>{
                        console.log('Update success');

                    })
                    .catch(error =>{
                        res.json({
                            success: false,
                            error: error.message ||error
                        })
                    })
            } else {
                delete cart[item];// neu giá trị của thuộc tính item =0 thì ta sẽ xóa session
                let cart_insert = {
                    session_user_id: id_user,
                    product_id: item
                };
                // đồng thời tiến hành xóa trong cơ sở dữ liệu với sesion_user_id và product_id tương ứng
                db.none('DELETE FROM carts WHERE session_user_id=${session_user_id} AND product_id=${product_id}', cart_insert)
                    .then(() => {
                        console.log('Cart: Delete Success');

                    })
                    .catch(error => {
                        res.json({
                            success: false,
                            error: error.message || error
                        });
                    });
            }
        }
    }
    // Sau khi xóa và update xong thì tiến hành render lại dữ liệu trong cơ sở  dữ liệu lên trang gio hang
    // lấy ra 1 mảng các thuộc tính để truy vẫn dữ liệu
    for(item in cart) {
        count++;
        if(count===1){
            ids += "'" + item + "'";
        } else {
            ids += ",'" + item + "'"
        }
    }
    // Tien hanh kiem tra trong gio hang co san pham khong
    let countCart = Object.keys(cart).length;
    if(countCart===0) {
        res.render('gio-hang.html',{
            title: 'Gio hang',
            product:'',
            cart:''
        })
    }
    db.task(t =>{
        return t.batch([
            product.cartID(ids),
            cart
        ])
    })
        .then(data => {
            let total =0;
            data[0].forEach(eachProduct =>{
                eachProduct.total = data[1][eachProduct.id] * eachProduct.price;
                total += eachProduct.total;
            })
            res.render('gio-hang.html',{
                title:'Gio hang',
                product: data[0],
                cart: data[1],
                total: total,
                login: req.session.login,
                user: req.session.user

            })
            //res.json(req.session.login)

        })
        .catch(error =>{
            res.json({
                succes: false,
                error:error.message || error
            })
        })

})
    return router
}