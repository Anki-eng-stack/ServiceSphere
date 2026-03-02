const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1
    });
    return res.json({ notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
