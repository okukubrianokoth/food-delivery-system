import express from "express";
import { createOrder, getOrders, getAllOrders, updateOrder } from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/all", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrder);

export default router;