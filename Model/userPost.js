const mongoose=require('mongoose');
const userPostSchema = new mongoose.Schema({
   user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    index:true
   },
    postTitle:{
        type:String,
        required:true
    },
    developerContent:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:new Date(Date.now())
    }
});
const Post = new mongoose.model('Post',userPostSchema);
module.exports = Post;