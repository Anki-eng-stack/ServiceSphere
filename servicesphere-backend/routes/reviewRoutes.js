const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { auth, requireRole } = require("../middleware/authMiddleware");

// Add review (customer only)
router.post(
  "/",
  auth,
  requireRole("customer"),
  reviewController.addReview
);

// Get all reviews for a service
router.get("/service/:serviceId", reviewController.getServiceReviews);

// Get average rating for a service
router.get("/service/:serviceId/average", reviewController.getAverageRating);

module.exports = router;
