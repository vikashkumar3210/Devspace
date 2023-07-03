const user = require('../Model/userModel.js');
const bcrypt = require('bcrypt');
// User Registration

module.exports.register = async (req, res) => {
    try {
        const userPresent = await user.findOne({ email: req.body.email });
        if (!userPresent) {
            if (req.body.password === req.body.confirm_password) {
                const { name,username, email, profile, password, confirm_password } = req.body;
                const userRegister = new user({
                  name,  username, email, profile, password, confirm_password
                });
                const token = await userRegister.generateToken();
                 await userRegister.save();
              await res.cookie('token', token, { expires: new Date(Date.now() + 24*60*60*1000), httpOnly: true });
              req.flash('message','Registration successful');
                res.redirect('/homeLogged');
            }
            else {
                req.flash('error','Password not matching !!');
                res.redirect('/');
            }
        }
        else {
            req.flash('error','User already exist with given email and username !!');
            res.redirect('/');
        }

    }
    catch (error) {
        req.flash('error','Try again to signup !!');
        res.redirect('/');
        
    }
}
//   User login
module.exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userPresent = await user.findOne({ $or: [{ username }, { email: username }] });
        if (userPresent) {
            const passwordMatch =  await bcrypt.compare(password, userPresent.password);
            if (passwordMatch) {
                const token = await userPresent.generateToken();
                res.cookie('token', token, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24), httpOnly: true });
                res.redirect('/homeLogged');
            }
            else{
                req.flash('error','Invalid login credential !!');
                req.session.save(()=>{res.redirect('/');})
            }
        }
        else {
            req.flash('error','Invalid login credential !!');
            res.redirect('/');
        }
    }
    catch (error) {
        req.flash('error','404 Not found!!')
        res.redirect('/');
    }
}