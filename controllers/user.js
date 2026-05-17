import User from "../models/User.js";
import { createError } from "../utils/error.js";

export const updateUser = async (req, res, next) => {
  try {
    const { isAdmin, password, ...safeBody } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: safeBody },
      { new: true }
    ).select("-password");
    if (!updatedUser) return next(createError(404, "User not found."));
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return next(createError(404, "User not found."));
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(createError(404, "User not found."));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
export const getUsers = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(pageSize),
      User.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: pageSize,
      users,
    });
  } catch (err) {
    next(err);
  }
};