const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type: String
    },
    mobile:{
        type:Number
    },
    gender:{
        type: String
    },
    city:{
        type: String
    },
    isVerifiedEmail :{
        type: Boolean,
        default: false
    },
    emailToken: {
        type: String
    }
})

module.exports = mongoose.model("admin", adminSchema)