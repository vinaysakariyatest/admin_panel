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
    isActive:{
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("admin", adminSchema)