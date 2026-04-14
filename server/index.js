import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import cors from 'cors'; // Import cors
// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS for all origins (you might want to restrict this in production)
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Add route imports here as needed
import foodRoutes from "./routes/foodRoutes.js";
import authRoutes from "./routes/authRoutes.js";
app.use("/api/foods", foodRoutes);
app.use("/api/auth", authRoutes);

// Basic Error Handling Middleware (should be placed after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Don't expose stack in production
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});