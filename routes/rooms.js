import express from "express";
import { body, param } from "express-validator";
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
  updateRoomAvailability,
} from "../controllers/room.js";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";
import { validateRequest } from "../utils/validate.js";

const router = express.Router();

const roomValidators = [
  body("title").trim().notEmpty().withMessage("Room title is required."),
  body("price").isNumeric().withMessage("Price must be a numeric value."),
  body("maxPeople")
    .isInt({ min: 1 })
    .withMessage("Max people must be at least 1."),
  body("desc").trim().notEmpty().withMessage("Description is required."),
];

const roomAvailabilityValidators = [
  param("id").isMongoId().withMessage("Invalid room id."),
  body("dates")
    .isArray({ min: 1 })
    .withMessage("Dates must be an array with at least one entry."),
];

//CREATE
router.post("/:hotelid", verifyAdmin, roomValidators, validateRequest, createRoom);

//UPDATE
router.put(
  "/availability/:id",
  verifyToken,
  roomAvailabilityValidators,
  validateRequest,
  updateRoomAvailability
);
router.put("/:id", verifyAdmin, roomValidators, validateRequest, updateRoom);
//DELETE
router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);
//GET

router.get("/:id", getRoom);
//GET ALL

router.get("/", getRooms);

export default router;