const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("service");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not pending payment" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: booking.service.title
            },
            unit_amount: booking.service.price * 100
          },
          quantity: 1
        }
      ],
      success_url: `http://localhost:3000/payment-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/my-bookings?payment=cancelled&bookingId=${booking._id}`
    });

    const payment = new Payment({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      amount: booking.service.price,
      orderId: session.id,
      status: "created"
    });

    await payment.save();

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Stripe server error" });
  }
};

// Confirm payment on success redirect and mark booking as paid
exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, sessionId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const paymentFilter = { booking: booking._id, customer: req.user._id };
    if (sessionId) paymentFilter.orderId = sessionId;

    const payment = await Payment.findOne(paymentFilter).sort({ createdAt: -1 });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    payment.status = "paid";
    if (sessionId) payment.paymentId = sessionId;
    await payment.save();

    if (booking.status === "pending") {
      booking.status = "paid";
      await booking.save();
    }

    return res.json({ message: "Payment confirmed", booking });
  } catch (err) {
    console.error("confirmPayment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
