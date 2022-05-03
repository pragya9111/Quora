const mongoose = require('mongoose');
const plm =require('passport-local-mongoose')
mongoose.connect('mongodb://localhost/quoradb');
const userSchema =  mongoose.Schema({
  name:String,
  username:String,
  contact:Number,
  gender:String,
  email:String,
  password:String,
  secret:String,
  expiry:{
    type:Date
  },
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }],
  question:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'question'
  }]

})
userSchema.plugin(plm);
module.exports=mongoose.model('users', userSchema)