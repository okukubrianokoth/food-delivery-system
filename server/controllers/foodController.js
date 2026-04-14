import Food from "../models/Food.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import https from "https";
import http from "http";

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Get all foods
export const getFoods = async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
};

// Get single food
export const getFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: "Food not found" });
  res.json(food);
};

// Upload image to Cloudinary from file
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "Image file too large (max 5MB)" });
    }

    let responded = false;
    const safeSend = (status, payload) => {
      if (responded) return;
      responded = true;
      res.status(status).json(payload);
    };

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "food-delivery",
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return safeSend(500, {
            message: "Image upload failed",
            error: error.message
          });
        }
        return safeSend(200, {
          message: "Image uploaded successfully",
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.on('error', (error) => {
      console.error("Stream upload error:", error);
      safeSend(500, { message: "Image upload failed", error: error.message });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

// Validate image URL
export const validateImageUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (error) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Guard against duplicate responses
    let responded = false;
    const safeSend = (status, payload) => {
      if (responded) return;
      responded = true;
      res.status(status).json(payload);
    };

    // Check if URL is accessible
    const protocol = imageUrl.startsWith('https') ? https : http;
    const request = protocol.get(imageUrl, { timeout: 5000 }, (response) => {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('image')) {
        return safeSend(400, { message: "URL must point to a valid image" });
      }
      if (response.statusCode !== 200) {
        return safeSend(400, { message: "Image URL is not accessible (Status: " + response.statusCode + ")" });
      }
      return safeSend(200, {
        message: "Image URL is valid",
        imageUrl: imageUrl,
        isValid: true,
      });
    });

    request.on('error', (error) => {
      console.error("URL validation error:", error.message);
      safeSend(400, { message: "Could not access the image URL: " + error.message });
    });

    request.on('timeout', () => {
      request.destroy();
      safeSend(400, { message: "Image URL request timed out" });
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ message: "URL validation failed", error: error.message });
  }
};

// Create food (Admin only)
export const createFood = async (req, res) => {
  try {
    const { name, price, description, image, category, ingredients, countInStock, shortDescription } = req.body;

    if (!name || !price || !image || !description) {
      return res.status(400).json({ message: "Please provide all required fields (name, price, image, description)" });
    }

    const food = await Food.create({ 
      name, 
      price, 
      description, 
      image, 
      category, 
      ingredients, 
      countInStock, 
      shortDescription 
    });
    res.status(201).json(food);
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({ message: "Error creating food item", error: error.message });
  }
};

// Update food
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // Only update fields provided in the request
    Object.keys(req.body).forEach((key) => {
      food[key] = req.body[key] ?? food[key];
    });

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete food
export const deleteFood = async (req, res) => {
  const deletedFood = await Food.findByIdAndDelete(req.params.id);
  if (!deletedFood) return res.status(404).json({ message: "Food not found" });
  res.json({ message: "Food deleted successfully" });
};

// Get top rated foods (Featured)
export const getTopFoods = async (req, res) => {
  const foods = await Food.find({}).sort({ rating: -1 }).limit(4);
  res.json(foods);
};