const mongoose=require('mongoose');
const followSchema =new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        index:true
    },
    follow_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        index:true
    }
});
const follow =new mongoose.model('follow',followSchema);
module.exports=follow;