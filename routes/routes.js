module.exports = (app, express) => {

    const home = require('./home')(express);
    app.use('/', home);
    const product = require('./product')(express)
    app.use('/book',product)
    const giohang = require('./giohang')(express)
    app.use('/gio-hang',giohang)
    const thanhtoan = require('./thanhtoan')(express)
    app.use('/thanh-cong',thanhtoan)

};