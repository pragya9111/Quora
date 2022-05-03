const mongoose = require('mongoose')
const questionSchema = mongoose.Schema({
    question:String,
    image:String,
    username:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'users' 
    },
    date:{
        type:Date,
        default:Date.now()
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    answer:[{
        username:String,
        answer:{type:String}
    }]
})
module.exports = mongoose.model('question', questionSchema);