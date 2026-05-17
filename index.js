import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import bookingsRoute from "./routes/bookings.js";
import paymentsRoute from "./routes/payments.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const app = express();

dotenv.config();

const PORT = process.env.PORT || 8800;
const NODE_ENV = process.env.NODE_ENV || "development";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

mongoose.connect(process.env.MONGO)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.set("trust proxy", 1);
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("hello first");
});

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/payments", paymentsRoute);

app.use((err, req, res, next) => {
  let errorStatus = err.status || 500;
  let errorMessage = err.message || "Something went wrong!";

  if (err.name === "CastError" || err.name === "BSONTypeError") {
    errorStatus = 400;
    errorMessage = "Invalid id format.";
  }

  const responseBody = {
    success: false,
    status: errorStatus,
    message: errorMessage,
  };

  console.error(err);

  if (NODE_ENV !== "production") {
    responseBody.stack = err.stack;
  }
  return res.status(errorStatus).json(responseBody);
});




app.listen(PORT, () => {
  console.log(`Connected to backend on port ${PORT}.`);
}); 