import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number], // [longitude, latitude]
    },
    vehicleType: { type: String, enum: ['motorcycle', 'car', 'bicycle'], default: 'motorcycle' },
    licenseNumber: { type: String },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

// Add index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model("Driver", driverSchema);