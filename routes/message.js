const mongoose = require('mongoose')



const messageSchema = mongoose.Schema({
    messageText:String,
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
})




module.exports = mongoose.model('message' , messageSchema)