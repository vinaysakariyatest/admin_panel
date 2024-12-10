const admin = require("../models/admin")
const adminModel = require("../models/admin")
const bcrypt = require("bcrypt")


// ===================Registration=================
exports.signupForm = async(req, res) => {
    res.render("signup")
}

exports.signup = async(req, res) => {
    try {
        const { name, email, password } = req.body

        // Check already exist email
        const hashPassword = await bcrypt.hash(password,10)
        const existEmail = await adminModel.findOne({ email })

        if(existEmail){
            return res.status(409).send("Email already exist")
        }

        const createAdmin = await adminModel.create({
            name,
            email,
            password:hashPassword
        })

        if(!createAdmin){
            return res.status(409).send("Registration Failed")
        }

        return res.status(201).send("Registration Seuccessfull")
    } catch (error) {
        return res.status(500).send("========ERROR on Registration=========",error)
    }
}

// ===================Login================
exports.loginForm = async(req, res) => {
    res.render('login')
}

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body

        // Check the Email is Register
        const findEmail = await adminModel.findOne({ email })

        if(!findEmail){
            return res.status(400).send("Invalid Email")
        }

        const isPasswordMatch = await bcrypt.compare(password, findEmail.password)

        if(!isPasswordMatch){
            return res.status(400).send("Invalid Password")
        }

         // Set user session
         req.session.isLoggedIn = true;
         req.session.user = findEmail;

        res.redirect("/dashboard")

    } catch (error) {
        return res.status(500).send("========ERROR on Login=========",error)
        
    }
}

// ================Dashboard===============
exports.dashboard = async(req, res) => {
    res.render("dashboard")
}

// ================Logout=================
exports.logout = async(req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Unable to logout");
            }
            res.redirect("/");
        });
}