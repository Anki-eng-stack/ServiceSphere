const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { auth, requireRole } = require("../middleware/authMiddleware");

// Customer creates booking
router.post("/", auth, requireRole("customer"), bookingController.createBooking);

// Get my bookings (customer or provider)
router.get("/my", auth, bookingController.getMyBookings);

// Provider accepts booking
router.patch("/:id/accept", auth, requireRole("provider"), bookingController.acceptBooking);

// Provider completes booking
router.patch("/:id/complete", auth, requireRole("provider"), bookingController.completeBooking);

// Provider rejects booking
router.patch("/:id/reject", auth, requireRole("provider"), bookingController.rejectBooking);

// Customer cancels booking
router.patch("/:id/cancel", auth, requireRole("customer"), bookingController.cancelBooking);

module.exports = router;
