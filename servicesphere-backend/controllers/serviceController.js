const Service = require("../models/Service");
const User = require("../models/User");

/**
 * Create a new service (provider or admin)
 */
exports.createService = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if (user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ message: "Only providers can create services" });
    }

    const { title, category, description, price, location, images, availability } = req.body;
    if (!title || !category || !price) {
      return res.status(400).json({ message: "title, category and price are required" });
    }

    const service = new Service({
      title,
      category,
      description: description || "",
      price,
      provider: user._id,
      location: location || user.location || "",
      images: Array.isArray(images) ? images : images ? [images] : [],
      availability: Array.isArray(availability) ? availability : []
    });

    await service.save();
    return res.status(201).json({ service });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get list of services with optional filters:
 * ?category=plumbing&location=Delhi&search=pipe&minPrice=100&maxPrice=1000&page=1&limit=10
 */
exports.getServices = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ title: re }, { description: re }, { category: re }];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate("provider", "name email location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Service.countDocuments(filter)
    ]);

    return res.json({
      services,
      total,
      page: Number(page),
      pages: Math.ceil(total / Math.max(1, Number(limit)))
    });
  } catch (err) {
    console.error("getServices error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single service by id
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("provider", "name email location avatarUrl");
    if (!service) return res.status(404).json({ message: "Service not found" });
    return res.json({ service });
  } catch (err) {
    console.error("getServiceById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a service (only provider who owns it or admin)
 */
exports.updateService = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // only owner or admin
    if (service.provider.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: not owner" });
    }

    const updatable = ["title", "category", "description", "price", "location", "images", "availability", "isActive"];
    updatable.forEach(key => {
      if (req.body[key] !== undefined) {
        service[key] = req.body[key];
      }
    });

    await service.save();
    return res.json({ service });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete service (soft delete by default) - owner or admin
 */
exports.deleteService = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.provider.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: not owner" });
    }

    // Soft delete
    service.isActive = false;
    await service.save();

    return res.json({ message: "Service deactivated" });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all services provided by a particular provider
 */
exports.getServicesByProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId || req.user?._id;
    const services = await Service.find({ provider: providerId, isActive: true }).populate("provider", "name email");
    return res.json({ services });
  } catch (err) {
    console.error("getServicesByProvider error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
