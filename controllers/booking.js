import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js";

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const createBooking = async (req, res, next) => {
  const {
    hotelId,
    roomId,
    roomNumberId,
    checkInDate,
    checkOutDate,
    totalPrice,
    guests,
  } = req.body;

  if (!hotelId || !roomId || !roomNumberId || !checkInDate || !checkOutDate || !totalPrice) {
    return next(createError(400, "Missing required booking details."));
  }

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return next(createError(400, "Invalid check-in or check-out dates."));
  }

  const dates = getDatesBetween(start, end);

  try {
    const room = await Room.findById(roomId);
    if (!room) return next(createError(404, "Room not found."));

    const roomNumber = room.roomNumbers.find((item) => item._id.toString() === roomNumberId);
    if (!roomNumber) return next(createError(404, "Room number not found."));

    const conflict = roomNumber.unavailableDates.some((bookedDate) =>
      dates.some((date) => new Date(bookedDate).toDateString() === date.toDateString())
    );
    if (conflict) {
      return next(createError(409, "Selected dates are unavailable."));
    }

    const booking = new Booking({
      userId: req.user.id,
      hotelId,
      roomId,
      roomNumberId,
      checkInDate: start,
      checkOutDate: end,
      dates,
      totalPrice,
      guests: guests || 1,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedBooking = await booking.save();

    await Room.updateOne(
      { "roomNumbers._id": roomNumberId },
      { $push: { "roomNumbers.$.unavailableDates": dates } }
    );

    res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found."));
    if (req.user.id !== booking.userId.toString() && !req.user.isAdmin) {
      return next(createError(403, "You are not authorized to view this booking."));
    }
    res.status(200).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return next(createError(403, "You are not authorized to view these bookings."));
    }

    const bookings = await Booking.find({ userId: req.params.id });
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found."));
    if (req.user.id !== booking.userId.toString() && !req.user.isAdmin) {
      return next(createError(403, "You are not authorized to cancel this booking."));
    }
    if (booking.status === "cancelled") {
      return next(createError(400, "Booking is already cancelled."));
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        paymentStatus: booking.paymentStatus === "completed" ? "refunded" : "cancelled",
      },
      { new: true }
    );

    await Room.updateOne(
      { "roomNumbers._id": booking.roomNumberId },
      { $pullAll: { "roomNumbers.$.unavailableDates": booking.dates } }
    );

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (err) {
    next(err);
  }
};