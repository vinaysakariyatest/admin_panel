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

// router.get('/adminList',admin.adminList)

router.get('/admin-list',admin.getAdminList)

// =======Delete AdminList=========
router.get('/delete/:id',admin.deleteadmin)

// ==========Update AdminList========
router.get("/update",admin.getUpdate)

// router.get("/update/:id",admin.updateData)
module.exports = router