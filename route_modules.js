const express = require('express');
const router = new express.Router();
const auth = require("./authentication.js")
const userController = require('./Controller/userController.js');
const userPostController = require('./Controller/userPostController.js');
const userFollowController = require('./Controller/userFollowController.js');
//Home page before login

router.get('/', (req, res) => {
    if (req.cookies.token) {
        res.redirect('/homeLogged');
    }
    else {
        let unsuccessMessage = req.flash('error');
        res.render("home_guest", { error: unsuccessMessage });
    }
});
//Home page after login
router.get('/homeLogged', auth, userPostController.allPost);
// user registration
router.post('/signup', userController.register);
// user login
router.post('/login', userController.login);
//user Logout
router.post('/logout', auth, (req, res) => {
    res.clearCookie('token');
    req.flash('error', 'Successfully logout !!');
    req.session.save(() => { res.redirect('/'); })
});
//User Profile
router.get('/myProfile', auth, userPostController.NoOfPost);
//Create user post
router.get('/createPost', auth, userPostController.userPost);
//adding user created post in database
router.post('/createPost', auth, userPostController.addingUserPost);

router.get('/singlePost/:id', auth, userPostController.singlePost);
router.post('/singlePost/:id', auth, userPostController.singlePostDelete);

router.get('/editPost/:id',auth,userPostController.editPost);
router.post('/editPost/:id',auth,userPostController.updatePost);
router.get('/userProfile/:username',auth,userPostController.userProfile);
router.post('/userProfile/:username',auth,userFollowController.userFollower);
router.get('/userProfile/unFollow/:id',auth,userFollowController.userUnfollow);
module.exports = router;