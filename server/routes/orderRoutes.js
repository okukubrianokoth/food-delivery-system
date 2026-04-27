import express from "express";
import {
  createOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  getOrderById,
  updateOrderStatus,
  assignDriverToOrder,
  updateDeliveryLocation
} from "../controllers/orderController.js";
import { protect, admin, driverProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/all", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, admin, updateOrder);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/assign-driver", protect, admin, assignDriverToOrder);
router.put("/:id/location", driverProtect, updateDeliveryLocation);

export default router;