const mongoose=require('mongoose');
const user = require('./Model/userModel.js');
const jwt = require('jsonwebtoken');
const md5=require('md5');
const auth=async(req,res,next)=>{
try{
    const token =req.cookies.token;
 
if(token){
const verifyId =await jwt.verify(token,process.env.SECRET_KEY);
const verifyUser = await user.findById({_id:verifyId.id});
const gravatarHash=await md5(verifyUser.email);
req.userLogged =verifyUser;
req.hashEmail=`https://gravatar.com/avatar/${gravatarHash}?s=128`
}
else{
    res.redirect('/');
}
next();
}
catch(error){
    console.log({error,au: " auth error"});
    res.redirect('/');
}
}
module.exports=auth;