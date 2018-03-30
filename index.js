

let log = console.log;

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const nunjucks = require('nunjucks');
const parseurl = require('parseurl');
const session = require('express-session');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const shortid = require('shortid');
const cookieParser = require('cookie-parser');
const { db, } = require('./pgp');
const csrf = require('csurf');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport')
const users = require('./routes/user')

// const csrfProtection = csrf({ cookie: true })

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser('cart'));

/*
app.use(cookieSession({
    secret: 'cart',
    // Cookie Options
    maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
}));
*/

app.use(session({
    secret: 'cart', // bat buoc dùng để đăng kí cookie sesion ID
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5*60*1000 }
}));
app.use(passport.initialize())
app.use(flash());
app.use(passport.session())
require('./passport/passport')(passport)
require('./passport/local/local')(passport)
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.login = true;
        req.session.user = req.user;
    } else {
        req.session.login = false;
        req.session.user = {};
    }
    next();
});
let dem = 0;
// dùng 1 midleware mỗi khi có request đến trang chủ thì kiểm tra nếu không có session  thì gán nó
// bằng 1 object rỗng
app.use('/', function (req, res, next) {
    dem++;
    //if(dem === 1) {
    if (!req.session.cart) {
        req.session.cart = {};
    }
    if (req.cookies['cart']) {
        let idCookieCart = req.cookies['cart'];
        console.log('gia tri cookies tu trang chu',idCookieCart);
        let cart = req.session.cart;

        if (Object.keys(cart).length > 0) {
            log('trong gio hang co san pham');
         } else {
            db.manyOrNone('SELECT * FROM carts WHERE session_user_id = $1', idCookieCart)
                .then((data) => {
                    data.forEach((i) => {
                        cart[i.product_id] = i.qty;
                     })
                 });
            console.log('in ra gia tri cart tu trang index',cart);
        }
    } else {
        res.cookie('cart', shortid.generate(), { maxAge: 3 * 24 * 60 * 60 * 1000 });

    }
    //}
    next();
});

nunjucks.configure('views', {
    autoescape: false,
    express: app,
    cache: false
});


app.engine('html', nunjucks.render);

app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

app.use('/users',users)
require('./routes/routes')(app, express);

const port = 5000;
app.listen(port, () => {
    console.log('Ready for GET requests on http://localhost:' + port);
});
