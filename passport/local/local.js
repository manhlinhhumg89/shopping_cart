const {db, } = require('../../pgp');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

module.exports = function(passport){
    passport.use(new LocalStrategy(
        function (username, password, done) {
            db.one('SELECT * FROM user_account WHERE email = $1', username)
                .then(data => {
                    if (data) {
                        bcrypt.compare(password, data.pass, function (err, res) {
                            if (err) return done(err);

                            if (res) return done(null, data.email);

                            return done(null, false, {message: 'Incorrect password.'});
                        });
                    } else {
                        return done(null, false, {message: 'Incorrect username.'})
                    }
                })
                .catch(error => {
                    return done(null, false, {message: 'Incorrect username.'})
                })
        }
    ));
}