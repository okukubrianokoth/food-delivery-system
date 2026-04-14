import Review from "../models/Review.js";
import Food from "../models/Food.js";

// Get reviews for a food
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ food: req.params.foodId }).populate("user", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching reviews", error: error.message });
  }
};

// Add review
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const food = await Food.findById(req.params.foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });

    const alreadyReviewed = food.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const reviewData = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      food: req.params.foodId,
    };

    // 1. Create entry in standalone Review collection (for getReviews)
    await Review.create(reviewData);

    // 2. Update the Food document (for embedded quick-view/averages)
    food.reviews.push(reviewData);
    food.numReviews = food.reviews.length;
    food.rating =
      food.reviews.reduce((acc, item) => item.rating + acc, 0) /
      food.reviews.length;

    await food.save();
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error adding review", error: error.message });
  }
};