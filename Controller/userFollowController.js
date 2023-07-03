const user = require('../Model/userModel.js');
const follow=require('../Model/userFollow.js');
module.exports.userFollower=async(req,res)=>{
     try{
      const followUser=await follow.findOne({$and:[{user_id:req.userLogged._id},{follow_id:req.params.username}]});
      if(!followUser){
        const addFollower = new follow({
            user_id:req.userLogged.id,
            follow_id:req.params.username
        });
        const result= await addFollower.save();
        req.flash('success','Follow successfull !!')
        req.session.save(()=>{res.redirect(`/userProfile/${req.params.username}`)});
      }
      else{
        req.flash('error','Follower is already exist !!')
        req.session.save(()=>{res.redirect(`/userProfile/${req.params.username}`)});
      }
     }
     catch(error){
        req.flash("error","Try Again Later !!");
        req.session.save(()=>{res.redirect(`/userProfile/${req.params.username}`)});
     }
}

module.exports.userUnfollow=async(req,res)=>{
    try{
       await follow.deleteOne({$and:[{user_id:req.userLogged._id},{follow_id:req.params.id}]});
       req.flash("success","Unfollow successfull !!");
       req.session.save(()=>{res.redirect(`/userProfile/${req.params.id}`)});
    }
    catch(error){
        req.flash("error","Try Again Later !!");
        req.session.save(()=>{res.redirect(`/userProfile/${req.params.id}`)});
    }
}