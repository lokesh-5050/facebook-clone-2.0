const mongoose = require('mongoose')



const postSchema = mongoose.Schema({
    caption: String,
    postimage: String,
    datetime: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    // likes:{type:Number , default:0}
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]

})


module.exports = mongoose.model('post', postSchema)