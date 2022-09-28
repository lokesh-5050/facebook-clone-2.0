const mongoose = require('mongoose')
// mongoose.connect( process.env.MONGODB);
mongoose.connect("mongodb://localhost/facebook")
const plm = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')



const userSchema = mongoose.Schema({
  username:{unique:true, type:String},
  email:{unique:true, type:String},
  age:{unique:true, type:Number},
  dob:{unique:true, type:Number},
  friends:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"add"
  }],
  profilePic:{type:String , default:"def.jpg"},
  
  sentMessages:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"message"
  }],
  
  receivedMessages:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"message"
  }],
  expiresAt:{type:Date , default:Date.now()},
  otp:{type:Number}
  
  
  
  

 
 
})

userSchema.plugin(plm , {usernameField:'email'})
userSchema.plugin(findOrCreate)


module.exports = mongoose.model('user' , userSchema)