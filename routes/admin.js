const express = require("express")
const router = express.Router()
const admin = require("../controller/admin")
const { isAuthenticated } = require("../Middleware/auth")

// ==========Registartion==========
router.get("/",admin.loginForm)
router.get("/signup",admin.signupForm)
router.post("/signup",admin.signup)

// ==========Login==========
router.post("/login",admin.login)

router.get("/dashboard",isAuthenticated,admin.dashboard)

router.get('/login', (req, res) => {
    res.render("login");
});
router.get('/logout',admin.logout)

module.exports = router