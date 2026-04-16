import express from "express";
import { getFoods, getFood, createFood, updateFood, deleteFood, getTopFoods, uploadImage, validateImageUrl, upload, getExternalFoods } from "../controllers/foodController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getFoods);
router.get("/external/foods", getExternalFoods);
router.get("/top", getTopFoods);
router.get("/:id", getFood);
router.post("/upload", protect, admin, upload.single("image"), uploadImage);
router.post("/validate-url", protect, admin, validateImageUrl);
router.post("/", protect, admin, createFood);
router.put("/:id", protect, admin, updateFood);
router.delete("/:id", protect, admin, deleteFood);

export default router;