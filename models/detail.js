const {db, } = require('../pgp');

class Detail {
    constructor(db) {
        this.db = db;
    }
    home(id){
        return this.db.many("SELECT * FROM bookstore WHERE id=$1",id)
    }
    category(){
        return this.db.many("SELECT c.id, c.name,(array( SELECT json_build_object('name', c_c.name, 'id', c_c.id) FROM category AS c_c WHERE c_c.parent = c.id)) AS cat_child FROM category as c WHERE parent = 0")
    }
    category_book(){
        return this.db.many("SELECT * FROM category  WHERE parent = 0")
    }
    detail_(){
        return this.db.many("SELECT book.*,ca.name AS name_category,cb.name AS name_category_book FROM bookstore AS book JOIN category AS cb ON cb.id = book.id_category JOIN category AS ca ON ca.id = cb.parent")
    }
}

module.exports = Detail;