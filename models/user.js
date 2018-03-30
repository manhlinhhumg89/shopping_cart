const {db, } = require('../pgp')
const bcrypt = require('bcryptjs');
class User {
    constructor(db) {
        this.db = db;
    }
    selectUser(email){
        return this.db.oneOrNone("SELECT * FROM user_account WHERE email =$1",[email])
    }
    generateHash(password){
        return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null)
    }
    addUser(email, hashPass, fullname, phone, gender, address, agreement) {
        return this.db.one("INSERT INTO user_account(email, pass, fullname, phone, gender, address, agreement) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, email, fullname, phone, gender, address", [ email, hashPass, fullname, phone, gender, address, agreement]);
    }
}
module.exports = User;