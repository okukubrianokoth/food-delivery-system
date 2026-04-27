import express from "express";
import {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverLocation,
  updateDriverAvailability,
  getNearbyDrivers,
  assignOrderToDriver,
  getDriverOrders,
  updateOrderStatus,
} from "../controllers/driverController.js";
import { protect, admin, driverProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.get("/nearby", getNearbyDrivers);

// Protected routes (require driver authentication)
router.get("/profile", driverProtect, getDriverProfile);
router.put("/location", driverProtect, updateDriverLocation);
router.put("/availability", driverProtect, updateDriverAvailability);
router.get("/orders", driverProtect, getDriverOrders);
router.put("/orders/status", driverProtect, updateOrderStatus);

// Admin routes (require admin authentication - to be implemented)
router.post("/assign-order", protect, admin, assignOrderToDriver);

export default router;