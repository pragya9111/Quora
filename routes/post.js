const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
    caption:String,
    imageurl:String,
    createdat:{
        type:Date,
        default:Date.now()
    },
    username:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }]
})
module.exports = mongoose.model('post', postSchema);
