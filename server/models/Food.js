import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

const foodSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  description: { type: String, required: true },
  shortDescription: { type: String },
  ingredients: [String],
  category: { type: String },
  price: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema],
  countInStock: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.model('Food', foodSchema);