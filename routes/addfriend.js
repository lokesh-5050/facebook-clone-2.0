const mongoose = require('mongoose')



const addfriend = mongoose.Schema({
    frndId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
    
})




module.exports = mongoose.model('add' , addfriend)