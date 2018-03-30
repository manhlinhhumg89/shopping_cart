const { db, } = require('../pgp');

const Product = require('../models/list_book');

const product = new Product(db)
module.exports = function (express,cart) {

    const router = express.Router();
    //Dinh nghia router cho trang dang nhap dang ki


    router.get('/', (req, res) => {
        let cart = req.session.cart; // khi truy cap vao trang chu thi se lay duoc session cua gio hang voi cart la 1 object voi thuoc tinh la id cua book
        let total1=0
        // dung vong lap trong object lap qua tung thuoc tinh lay gia tri cua no
        for(let item in cart) {
           total1 += parseInt(cart[item])
        }
        // luu gia tri total1 vao session total
        req.session.total = total1;


        db.task(t=>{
            return t.batch([
                product.selectAll(),
                product.category_inside()
            ])
        })
            .then(data =>{
                    res.render('index',{
                    data:data[0],
                    category: data[1],
                    total1: req.session.total,
                        login: req.session.login,
                        user: req.session.user
                })
            })
            .catch(error => {
                return error.detail;
            });
    })
    router.get('/sign-up',(req,res) =>{
        res.render('register.html')
    })
    router.get('/login',(req,res) =>{
        res.render('login.html')
    })

    router.get('/huy-don-hang',(req,res) =>{
        //let id_user = req.cookies['cart'];
        let cart = req.session.cart;
        let user_id = req.session.user.user_id;
        db.any("DELETE FROM detailed_orders WHERE user_id = $1 RETURNING user_id",user_id)
            .then((data) =>{
                db.none("DELETE FROM orders WHERE user_id =$1",data[0].user_id )
                    .then(() =>{
                        console.log('DELETE SUCCESS!')
                        res.redirect('/')
                    })
                    .catch(err =>{
                        console.log('loi khi xoa bang orders')
                    })
            })
            .catch(err =>{
                console.log(err)
            })

    })
    return router
}