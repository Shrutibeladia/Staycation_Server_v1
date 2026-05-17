import express from "express";
import { body } from "express-validator";
import { createPaymentIntent, confirmPayment } from "../controllers/payment.js";
import { verifyToken } from "../utils/verifyToken.js";
import { validateRequest } from "../utils/validate.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("A valid amount is required."),
    body("bookingId").notEmpty().withMessage("bookingId is required."),
  ],
  validateRequest,
  createPaymentIntent
);

router.post(
  "/confirm",
  verifyToken,
  [
    body("bookingId").notEmpty().withMessage("bookingId is required."),
    body("paymentIntentId").notEmpty().withMessage("paymentIntentId is required."),
  ],
  validateRequest,
  confirmPayment
);

export default router;
