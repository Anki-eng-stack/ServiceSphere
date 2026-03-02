const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { auth, requireRole } = require("../middleware/authMiddleware");

// Create service (provider only)
router.post(
  "/",
  auth,
  requireRole("provider"),
  serviceController.createService
);

// Get all services (public)
router.get("/", serviceController.getServices);

// Get single service by id (public)
router.get("/:id", serviceController.getServiceById);

// Update service (owner or admin)
router.put("/:id", auth, serviceController.updateService);

// Delete service (owner or admin)
router.delete("/:id", auth, serviceController.deleteService);

// Get services by provider (optional)
router.get("/provider/:providerId", serviceController.getServicesByProvider);

module.exports = router;
