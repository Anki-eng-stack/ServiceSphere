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

// Get services for logged-in provider
router.get(
  "/provider/me",
  auth,
  requireRole("provider"),
  serviceController.getServicesByProvider
);

// Get services by provider id (public)
router.get("/provider/:providerId", serviceController.getServicesByProvider);

// Update service (owner or admin)
router.put("/:id", auth, serviceController.updateService);

// Delete service (owner or admin)
router.delete("/:id", auth, serviceController.deleteService);

// Get single service by id (public)
router.get("/:id", serviceController.getServiceById);

module.exports = router;
