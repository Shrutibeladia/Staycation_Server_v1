import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { createError } from "../utils/error.js";

const stripe = new Stripe(process.env.STRIPE_KEY || "");

export const createPaymentIntent = async (req, res, next) => {
  const { amount, currency = "usd", bookingId } = req.body;

  if (!process.env.STRIPE_KEY) {
    return next(createError(500, "Stripe secret key is not configured."));
  }
  if (!amount || !bookingId) {
    return next(createError(400, "Amount and bookingId are required."));
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(createError(404, "Booking not found."));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      metadata: { bookingId },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req, res, next) => {
  const { bookingId, paymentIntentId } = req.body;

  if (!bookingId || !paymentIntentId) {
    return next(createError(400, "bookingId and paymentIntentId are required."));
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(createError(404, "Booking not found."));

    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentDetails = { paymentIntentId };
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};