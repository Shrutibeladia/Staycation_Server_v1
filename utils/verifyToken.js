import jwt from "jsonwebtoken"
import { createError } from "../utils/error.js";
import { getTokenFromRequest } from "./authCookie.js";

const isAdminUser = (user) => user?.role === "admin";

export const verifyToken = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.id === req.params.id || isAdminUser(req.user)) {
      return next();
    }
    return next(createError(403, "You are not authorized!"));
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (isAdminUser(req.user)) {
      return next();
    }
    return next(createError(403, "You are not authorized!"));
  });
};