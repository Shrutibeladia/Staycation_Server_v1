import express from "express";
import { body, param } from "express-validator";
import {
  createBooking,
  getBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/booking.js";
import { verifyToken } from "../utils/verifyToken.js";
import { validateRequest } from "../utils/validate.js";

const router = express.Router();

const bookingValidators = [
  body("hotelId").notEmpty().withMessage("hotelId is required."),
  body("roomId").notEmpty().withMessage("roomId is required."),
  body("roomNumberId").notEmpty().withMessage("roomNumberId is required."),
  body("checkInDate").isISO8601().toDate().withMessage("Valid checkInDate is required."),
  body("checkOutDate").isISO8601().toDate().withMessage("Valid checkOutDate is required."),
  body("totalPrice").isFloat({ gt: 0 }).withMessage("totalPrice must be a positive number."),
  body("guests").optional().isInt({ gt: 0 }).withMessage("guests must be at least 1."),
];

router.post("/", verifyToken, bookingValidators, validateRequest, createBooking);
router.get("/:id", verifyToken, getBooking);
router.get("/user/:id", verifyToken, getUserBookings);
router.put("/:id/cancel", verifyToken, cancelBooking);

export default router;
