const express = require("express")
const router = express.Router()
const admin = require("../controller/admin")
const { isAuthenticated } = require("../Middleware/auth")

// ==========Registartion==========
router.get("/",admin.loginForm)

router.get("/signup",admin.signupForm)
router.post("/signup",admin.signup)

// =========Verify Mail========
router.get("/verify-mail",admin.verifyEmail)

// ============Reset Password==========
router.get("/resetForm",admin.getResetForm)

router.get("/resetLink", async (req, res) => {
    res.render("resetLink")
})

router.post("/reset-link",admin.sendResetLink)

// router.get("/paswordForm", admin.getResetPassForm)
router.get("/reset-password", async (req, res) => {
    res.render("resetPassword")
})

router.post("/reset-password",admin.resetPassword)

// ==========Login==========
router.post("/login",admin.login)

router.get("/dashboard",isAuthenticated,admin.dashboard)

router.get('/login', (req, res) => {
    res.render("login");
});

router.get('/logout',admin.logout)

router.get('/admin-list',isAuthenticated,admin.getAdminList)

// =======Delete AdminList=========
router.get('/delete/:id',admin.deleteadmin)

// ==========Update AdminList========
router.get("/update/:id",admin.getUpdate)

router.post("/update/:id",admin.updateAdmin)

// ===========City================
router.get("/city",isAuthenticated,admin.getCity)

router.post("/city",admin.addCity)

router.post("/city/:id/status",admin.cityStatus)

router.get("/update_c/:id",admin.getUpdateCity)

router.post("/update_c/:id",admin.updateCity)

router.get("/delete_c/:id",admin.deleteCity)
module.exports = router