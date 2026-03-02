const express = require("express");
const router = express.Router();
const { sendMessage, getMessagesByBooking } = require("../controllers/messageController");
const { auth } = require("../middleware/authMiddleware");

// Send message
router.post("/", auth, sendMessage);

// Get messages by booking
router.get("/:bookingId", auth, getMessagesByBooking);

module.exports = router;
