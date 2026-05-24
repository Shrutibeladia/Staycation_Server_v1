import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs";
import path from "path";
import streamifier from "streamifier";

export const createHotel = async (req, res, next) => {
  try {
    console.log("createHotel called");
    console.log("req.body keys:", Object.keys(req.body));
    console.log(
      "req.files:",
      Array.isArray(req.files)
        ? req.files.map((f) => ({
            originalname: f.originalname,
            size: f.size,
            hasPath: !!f.path,
            hasBuffer: !!f.buffer,
          }))
        : req.files
    );

    const hotelData = { ...req.body };
    const photos = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          let result;
          if (file.path) {
            result = await cloudinary.uploader.upload(file.path, {
              folder: "staycation/hotels",
              resource_type: "auto",
            });
          } else if (file.buffer) {
            result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "staycation/hotels", resource_type: "auto" },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                }
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
          } else {
            throw new Error("No file.path or file.buffer available for upload");
          }

          photos.push(result.secure_url || result.url);

          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
          }
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
          }
          return next(createError(500, "Image upload failed"));
        }
      }
    }

    if (photos.length > 0) {
      hotelData.photos = photos;
    }

    const newHotel = new Hotel(hotelData);
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    console.error("createHotel unexpected error:", err);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
          });
        }
      });
    }
    next(err);
  }
};
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedHotel) return next(createError(404, "Hotel not found."));
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!deletedHotel) return next(createError(404, "Hotel not found."));
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return next(createError(404, "Hotel not found."));
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
export const getHotels = async (req, res, next) => {
  const { min, max, page = 1, limit = 10, ...others } = req.query;
  const minPrice = min ? Number(min) : 1;
  const maxPrice = max ? Number(max) : 99999;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * pageSize;

  const filter = {
    ...others,
    cheapestPrice: { $gt: minPrice, $lt: maxPrice },
  };

  try {
    const [hotels, total] = await Promise.all([
      Hotel.find(filter).skip(skip).limit(pageSize),
      Hotel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: pageSize,
      hotels,
    });
  } catch (err) {
    next(err);
  }
};
export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotel.countDocuments({ city: city });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    res.status(200).json(list)
  } catch (err) {
    next(err);
  }
};

