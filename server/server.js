import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js"; // Assuming this exists and connects to MongoDB
import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"; // Assuming these exist

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/foods/:foodId/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Centralized Error Handling Middleware (from index.js, more robust)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Don't expose stack in production
  });
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));