const express = require('express')

const authController = require('./../controllers/authController')

const router = express.Router()

router.post("/signup", authController.singup)
router.post("/login", authController.login)


router.post("/forgotpassword", authController.forgotPassword)
router.ppatch("/resetpassword", authController.resetPassword)


module.exports = router