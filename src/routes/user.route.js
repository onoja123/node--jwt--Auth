const express = require('express');
const userController = require("../controllers/user.controller")
const authController = require('./../controllers/auth.controller');

const router = express()

// Middleware to protect all routes below from unauthorized access
router.use(authController.protect);

// Get all users route - Retrieve a list of all users
router.get("/users", userController.getAll);

// Get user profile route - Retrieve user's profile by ID
router.get("/profile", userController.getProfile);

// Delete user profile route - Delete user's profile by ID (Admin only)
router.delete("/deleteprofile/:id", authController.restrict('Admin'), userController.deleteUser);

module.exports = router;