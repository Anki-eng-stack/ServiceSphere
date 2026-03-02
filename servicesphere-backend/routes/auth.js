const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get profile (protected)
router.get("/profile", auth, authController.getProfile);

// Forgot password (send OTP)
router.post("/forgot-password", authController.forgotPassword);

// Reset password with OTP
router.post("/reset-password", authController.resetPassword);

module.exports = router;
