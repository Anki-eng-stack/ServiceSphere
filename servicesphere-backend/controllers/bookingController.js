const Booking = require("../models/Booking");
const Service = require("../models/Service");

// Customer creates booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date, time } = req.body;
    const customer = req.user;

    if (!serviceId || !date || !time) {
      return res.status(400).json({ message: "serviceId, date and time are required" });
    }

    const service = await Service.findById(serviceId).populate("provider");
    if (!service) return res.status(404).json({ message: "Service not found" });

    const booking = new Booking({
      customer: customer._id,
      provider: service.provider._id,
      service: service._id,
      date,
      time
    });

    await booking.save();
    return res.status(201).json({ booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get bookings for logged-in user (customer or provider)
exports.getMyBookings = async (req, res) => {
  try {
    const user = req.user;

    let filter = {};
    if (user.role === "customer") filter.customer = user._id;
    if (user.role === "provider") filter.provider = user._id;

    const bookings = await Booking.find(filter)
      .populate("customer", "name email")
      .populate("provider", "name email")
      .populate("service", "title price");

    return res.json({ bookings });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Provider accepts booking
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only provider can accept
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "accepted";
    await booking.save();

    return res.json({ booking });
  } catch (err) {
    console.error("acceptBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark booking as completed
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only provider can complete
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "completed";
    await booking.save();

    return res.json({ booking });
  } catch (err) {
    console.error("completeBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Customer cancels booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only customer can cancel
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json({ booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
