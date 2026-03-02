const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { auth, requireRole } = require("../middleware/authMiddleware");

// Create Stripe checkout session (customer only)
router.post(
  "/stripe",
  auth,
  requireRole("customer"),
  paymentController.createCheckoutSession
);

// Confirm payment success (customer only)
router.post(
  "/confirm",
  auth,
  requireRole("customer"),
  paymentController.confirmPayment
);

module.exports = router;
