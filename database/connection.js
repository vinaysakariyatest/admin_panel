const mongoose = require("mongoose")

const DB = process.env.DATABASE_URL

mongoose.connect(DB)
.catch((err) => {
    console.log("Faield to connect Database!")
})