const {db, } = require('../pgp');
const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const user = new User(db);
const router = express.Router()
//Router xu ly phan dang ky
router.post('/sign-up',(req,res)=>{
    if(req.body.password !== req.body.password2) {
        req.flash('error','Password do not match')
        res.status(401).render('index',{login: req.session.login})
    } else {
        user.selectUser(req.body.email)
            .then(data => {
                if(data ===null){
                    let hassPass = user.generateHash(req.body.password)
                    user.addUser(req.body.email,hassPass,req.body.fullname,req.body.phone,req.body.gender,req.body.address,req.body.agreement)
                        .then((data) =>{
                            console.log('Insert account succesfully');
                            req.session.login =true;
                            req.session.user = data;// du lieu duoc luu vao session
                           // req.flash('success', 'You sign up successfully!');
                            res.render('test', { login: req.session.login, user: req.session.user.email });
                        })
                        .catch(error =>{
                            console.log(error.message)
                        })
                } else {
                    //username nay da co trong co so du lieu
                    req.flash('error','Account already exists. Please log in or register another account!');
                    res.status(401).render('index')
                }
            })
            .catch(error => {
                console.log(error.message)
            })
    }
});
// ROuter xu ly phan dang nhap co dung passport
router.post('/login',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect: '/', // redirect tro lai trang chu de hien thi messages thong bao
    failureFlash: true
}))
router.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('/')
})

module.exports = router;