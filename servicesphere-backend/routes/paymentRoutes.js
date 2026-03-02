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

module.exports = router;
