const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { sendMail } = require("../utils/mailer");

const sendPaymentSuccessEmails = async (booking, payment, session) => {
  const providerEmail = booking.provider?.email;
  const customerEmail = booking.customer?.email;
  const providerName = booking.provider?.name || "Provider";
  const customerName = booking.customer?.name || "Customer";
  const serviceTitle = booking.service?.title || "service";
  const amount = payment?.amount ?? booking.service?.price ?? "";
  const date = booking.date || "";
  const time = booking.time || "";
  const reference = session?.id || payment?.orderId || "";

  const providerSubject = "New payment received for booking";
  const providerText =
    `Hello ${providerName},\n\n` +
    `A customer payment was received for "${serviceTitle}".\n` +
    `Amount: INR ${amount}\n` +
    `Schedule: ${date} ${time}\n` +
    `Reference: ${reference}\n\n` +
    "Please review and accept the booking in your dashboard.";

  const customerSubject = "Payment successful for your booking";
  const customerText =
    `Hello ${customerName},\n\n` +
    `Your payment for "${serviceTitle}" was successful.\n` +
    `Amount: INR ${amount}\n` +
    `Schedule: ${date} ${time}\n` +
    `Reference: ${reference}\n\n` +
    "Your booking is now marked as paid and awaiting provider acceptance.";

  const results = await Promise.allSettled([
    sendMail({ to: providerEmail, subject: providerSubject, text: providerText }),
    sendMail({ to: customerEmail, subject: customerSubject, text: customerText })
  ]);

  results.forEach((result, idx) => {
    if (result.status === "rejected") {
      const recipient = idx === 0 ? "provider" : "customer";
      console.error(`Payment email failed for ${recipient}:`, result.reason);
    }
  });
};

const markPaymentAndBookingPaid = async (session) => {
  const payment = await Payment.findOne({ orderId: session.id });
  if (!payment) {
    throw new Error(`Payment record not found for session ${session.id}`);
  }
  const wasAlreadyPaid = payment.status === "paid";

  payment.status = "paid";
  if (session.payment_intent) {
    payment.paymentId = String(session.payment_intent);
  }
  await payment.save();

  const booking = await Booking.findById(payment.booking)
    .populate("provider", "name email")
    .populate("customer", "name email")
    .populate("service", "title price");
  if (!booking) {
    throw new Error(`Booking not found for payment ${payment._id}`);
  }

  if (booking.status === "pending") {
    booking.status = "paid";
    await booking.save();
  }

  if (!wasAlreadyPaid) {
    await Notification.create({
      user: booking.provider,
      message: "New payment received for booking"
    });

    // Non-blocking for payment lifecycle; errors are logged in helper.
    await sendPaymentSuccessEmails(booking, payment, session);
  }

  return { payment, booking };
};

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
      client_reference_id: booking._id.toString(),
      metadata: {
        bookingId: booking._id.toString(),
        customerId: booking.customer.toString()
      },
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
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      customer: req.user._id,
      orderId: sessionId
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Verify from Stripe to avoid trusting only query params.
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const result = await markPaymentAndBookingPaid(session);

    return res.json({ message: "Payment confirmed", booking: result.booking });
  } catch (err) {
    console.error("confirmPayment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Stripe webhook (source of truth for payment confirmation)
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("handleStripeWebhook: STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      await markPaymentAndBookingPaid(session);
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object;
      const payment = await Payment.findOne({ orderId: session.id });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("handleStripeWebhook processing error:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
