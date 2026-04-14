import express from "express";
import { loginUser, registerUser, verifyOTP, resendOTP, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;