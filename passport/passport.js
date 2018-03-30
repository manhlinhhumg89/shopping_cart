const {db,} = require('../pgp');
module.exports = function (passport) {
    //Dữ liệu ở serializeUser trả về và lưu vào session.passport
    passport.serializeUser(function (user, done) {
        console.log('serializeUser', user)
        done(null, user);
    });

    //Dữ liệu ở deserializeUser trả về và lưu vào req.user
    passport.deserializeUser(function (user, done) {
        console.log('deserializeUser', user)
        db.one('SELECT * FROM user_account WHERE email = $1', user)
            .then(data => {
                console.log('gia tri data ',data)
                done(null, data);// du lieu o day se duoc luu vao trong session sau moi lan dang nhap
            })
            .catch(err => {
                done(err, user);
            })

    });
}