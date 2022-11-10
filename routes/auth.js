const express = require("express")
const router = express.Router()

const authController = require("../controllers/authController")
//signup users
router.route("/signup")
.post(authController.signup)

//signup users
router.route("/login")
.post(authController.login)

router.route("/forgotPassword")
.post(authController.forgotPassword)

router.route("/resetPassword")
.patch(authController.resetPassword)

module.exports = router;