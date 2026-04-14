import express from "express";
import { initiatePayment, handleMpesaCallback } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/stkpush", protect, initiatePayment);
router.post("/callback", handleMpesaCallback); // M-Pesa callback endpoint

export default router;