import express from "express";
import { body } from "express-validator";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getHotel,
  getHotelRooms,
  getHotels,
  updateHotel,
} from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";
import { validateRequest } from "../utils/validate.js";
const router = express.Router();

const hotelValidators = [
  body("name").trim().notEmpty().withMessage("Hotel name is required."),
  body("type").trim().notEmpty().withMessage("Hotel type is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("address").trim().notEmpty().withMessage("Address is required."),
  body("distance").trim().notEmpty().withMessage("Distance is required."),
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("desc").trim().notEmpty().withMessage("Description is required."),
  body("cheapestPrice")
    .isNumeric()
    .withMessage("Cheapest price must be a numeric value."),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5."),
];

//CREATE
router.post("/", verifyAdmin, hotelValidators, validateRequest, createHotel);

//UPDATE
router.put("/:id", verifyAdmin, hotelValidators, validateRequest, updateHotel);
//DELETE
router.delete("/:id", verifyAdmin, deleteHotel);
//GET

router.get("/find/:id", getHotel);
//GET ALL

router.get("/", getHotels);
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/room/:id", getHotelRooms);

export default router;