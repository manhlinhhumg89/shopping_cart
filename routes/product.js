const { db, } = require('../pgp');
const shortid = require('shortid');
const Product = require('../models/list_book');
const Detail = require('../models/detail')

const product = new Product(db);
const detail = new Detail(db);

module.exports = function (express) {

    const router = express.Router();


    router.get('/', (req, res, next) => {
        db.task(t=>{
            return t.batch([
                product.selectAll(),
                product.category_inside()
            ])
        })
            .then(data =>{
                res.render('index',{
                    data:data[0],
                    category: data[1]
                })
            })
            .catch(error => {
                return error.detail;
            });
    })
    router.get('/:id',(req,res) =>{
        const id = req.params.id
        db.task(t=>{
            return t.batch([
                detail.home(id),
                detail.category_book()

            ])
        })
            .then(data =>{
                res.render('detail_book',{
                    detail: data[0],
                    category:data[1],
                    total1: req.session.total,
                    login: req.session.login,
                    user: req.session.user
                })

            })
            .catch(error =>{
                console.log(error)
            })
    })

    return router
}