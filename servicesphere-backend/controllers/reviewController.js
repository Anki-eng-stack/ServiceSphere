const Review = require("../models/Review");
const Booking = require("../models/Booking");

// Add review (customer only, after completed booking)
exports.addReview = async (req, res) => {
  try {
    const { serviceId, providerId, rating, comment } = req.body;
    const customerId = req.user._id;

    // Check booking completed
    const booking = await Booking.findOne({
      customer: customerId,
      service: serviceId,
      status: "completed"
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can review only after completing the service"
      });
    }

    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne({
      customer: customerId,
      service: serviceId
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this service"
      });
    }

    const review = new Review({
      customer: customerId,
      provider: providerId,
      service: serviceId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("addReview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews for a service
exports.getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("getServiceReviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get average rating for a service
exports.getAverageRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { service: require("mongoose").Types.ObjectId(req.params.serviceId) } },
      {
        $group: {
          _id: "$service",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({ avgRating: 0, totalReviews: 0 });
    }

    res.json({
      avgRating: result[0].avgRating.toFixed(1),
      totalReviews: result[0].totalReviews
    });
  } catch (err) {
    console.error("getAverageRating error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
