const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "customer", location } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
      location
    });

    await user.save();

    const token = generateToken(user._id);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
    };

    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user comes from auth middleware and excludes password
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const safeUser = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      location: req.user.location,
    };
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    // Keep response generic to avoid account enumeration
    if (!user) {
      return res.json({ message: "If the account exists, OTP has been sent to email" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtp = otpHash;
    user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your ServiceSphere OTP is ${otp}. It expires in 10 minutes.`
    });

    return res.json({ message: "If the account exists, OTP has been sent to email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "email, otp and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== otpHash ||
      !user.resetOtpExpire ||
      user.resetOtpExpire.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
