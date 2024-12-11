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
router.get("/update/:id",admin.getUpdate)

router.post("/update/:id",admin.updateAdmin)

// ===========City================
router.get("/city",admin.getCity)

router.post("/city",admin.addCity)

router.post("/city/:id/status",admin.cityStatus)

router.get("/update_c/:id",admin.getUpdateCity)

router.post("/update_c/:id",admin.updateCity)

router.get("/delete_c/:id",admin.deleteCity)
module.exports = router