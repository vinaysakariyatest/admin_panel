const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const ejs = require("ejs")
const session = require("express-session")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/images'))
app.use(express.static(__dirname + '/plugins'))
app.use(express.static(__dirname + '/js'))

app.use(
    session({
        secret: "thisisdashboardsecretkey",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

require("dotenv").config()
require("./database/connection")

const adminRoute = require("./routes/admin")

app.use("/",adminRoute)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is running on PORT Number: ${PORT}`)
})

