const express = require('express');
const router = express();

const authController = require("../controllers/auth.controller")

// Ping route - Check if the server is running
router.get("/", authController.ping);

// Signup route - User signup 
router.post("/signup", authController.signup);

// Login route - User login
router.post("/login", authController.login);

// Verify route - Verify user's email after signup
router.post("/verify", authController.verify);

// Forgot password route - Initiate password reset process
router.post('/forgotPassword', authController.forgotPassword);

// Reset password route - Reset user's password using OTP
router.post("/resetpassword", authController.resetPassword);

// Resend verification route - Resend verification OTP
router.post("/resendverification", authController.resendVerification);

// Logout route - Log out the user
router.post("/logout", authController.logout);

// Protect route middleware - Requires authentication for routes below
router.use(authController.protect);

// Update password route - Update user's password
router.patch("/updatepassword", authController.updatePassword);

module.exports = router;
