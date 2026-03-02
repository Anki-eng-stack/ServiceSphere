const mongoose = require("mongoose");
const Message = require("../models/Message");
const Booking = require("../models/Booking");

// ========================
// SEND MESSAGE
// ========================
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, text } = req.body;

    // 1. Validate input
    if (!bookingId || !text) {
      return res.status(400).json({ message: "bookingId and text are required" });
    }

    // 2. Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    // 3. Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 4. Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 5. Ensure user is part of the booking
    const userId = req.user.id.toString();

    if (
      booking.customer.toString() !== userId &&
      booking.provider.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to send messages for this booking" });
    }

    // 6. Decide receiver
    let receiver;
    if (req.user.role === "customer") {
      receiver = booking.provider;
    } else {
      receiver = booking.customer;
    }

    // 7. Save message
    const message = await Message.create({
      sender: userId,
      receiver,
      booking: bookingId,
      text: text.trim()
    });

    res.status(201).json(message);

  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// GET MESSAGES BY BOOKING
// ========================
exports.getMessagesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    // 2. Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 3. Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id.toString();

    // 4. Ensure user is part of the booking
    if (
      booking.customer.toString() !== userId &&
      booking.provider.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view these messages" });
    }

    // 5. Fetch messages
    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.error("getMessagesByBooking error:", err);
    res.status(500).json({ message: err.message });
  }
};
