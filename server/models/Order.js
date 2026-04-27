import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        food: { type: mongoose.Schema.Types.Mixed, required: true }, // Accept ObjectId or String for external foods
        name: { type: String },
        price: { type: Number },
        image: { type: String },
        source: { type: String }, // 'local', 'mealdb', 'sampleapis', 'cocktaildb'
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryNotes: { type: String },
    status: { type: String, default: "Pending", enum: ["Pending", "Preparing", "Ready", "assigned", "picked_up", "out_for_delivery", "delivered", "cancelled", "Cancelled"] },
    mpesaRequestId: { type: String },
    paymentConfirmed: { type: Boolean, default: false },
    deliveryLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    estimatedDeliveryTime: { type: Date }, // estimated delivery time
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    confirmedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);