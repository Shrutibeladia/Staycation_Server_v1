import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { createError } from "../utils/error.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createPaymentIntent = async (req, res, next) => {
  const { amount, currency = "INR", bookingId } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return next(createError(500, "Razorpay keys are not configured."));
  }
  if (!amount || !bookingId) {
    return next(createError(400, "Amount and bookingId are required."));
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(createError(404, "Booking not found."));

    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: bookingId,
      payment_capture: 1,
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req, res, next) => {
  const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!bookingId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return next(createError(400, "bookingId, razorpayPaymentId, razorpayOrderId, and razorpaySignature are required."));
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(createError(404, "Booking not found."));

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return next(createError(400, "Payment verification failed."));
    }

    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};