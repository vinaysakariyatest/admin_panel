const mongoose = require("mongoose")

const citySchema = new mongoose.Schema({
    city:{
        type:String
    },
    isActive:{
        type:Boolean,
        default: false
    }
})

module.exports = mongoose.model('city',citySchema)