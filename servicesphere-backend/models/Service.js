const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: String }, // e.g. "Monday" (optional, you can use dates instead)
  from: { type: String },      // e.g. "09:00"
  to: { type: String }         // e.g. "17:00"
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },        // e.g. "Home Plumbing"
  category: { type: String, required: true, trim: true },     // e.g. "plumbing", "electrician", "tutor"
  description: { type: String, trim: true },
  price: { type: Number, required: true },                    // base price
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, trim: true },                     // city / area
  images: [{ type: String }],                                 // Cloudinary urls or similar
  availability: [availabilitySlotSchema],                     // optional availability slots
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Service", serviceSchema);
