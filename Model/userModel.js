const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
   profile:{
    type:String,
    default:"Developer"
   } ,
   email:{
    type:String,
    required:true,
    unique:true
   },
   password:{
    type:String,
    required:true
   },
   date:{
    type:Date,
    default:new Date(Date.now())
   }
});
userSchema.pre('save', async function(next){
    if( this.isModified('password')){
    this.password= await bcrypt.hash(this.password,10);
    this.confirmed_password=undefined;
    }
    next();
});
userSchema.methods.generateToken=async function(){
   try{
     const token=await jwt.sign({id:this._id},process.env.SECRET_KEY);
     return token;
   }
   catch(error){
   console.log('token not generated');
   
   }
}
const user =new mongoose.model('user', userSchema);
module.exports=user;