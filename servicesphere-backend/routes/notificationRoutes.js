const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { auth } = require("../middleware/authMiddleware");

// Get notifications for logged-in user
router.get("/", auth, notificationController.getNotifications);

module.exports = router;
