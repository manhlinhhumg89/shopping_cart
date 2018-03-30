const {db, } = require('../pgp');

class Product {
    constructor(db) {
        this.db = db;
    }
    selectAll(){
        return this.db.many("SELECT * FROM bookstore")
    }
    category_inside(){
        return this.db.many("SELECT * FROM category  WHERE parent = 0")
    }
    cartID(id) {
        return this.db.many("SELECT id, name, price FROM bookstore WHERE id IN (" + id +")");
    }
}

module.exports = Product;