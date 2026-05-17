import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { login, register } from "../controllers/auth.js";
import { validateRequest } from "../utils/validate.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth requests from this IP, please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  [
    body("username").trim().notEmpty().withMessage("Username is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("username").trim().notEmpty().withMessage("Username is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login
);

export default router; 