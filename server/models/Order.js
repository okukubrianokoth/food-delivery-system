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
    phoneNumber: { type: String },
    status: { type: String, default: "Pending" },
    mpesaRequestId: { type: String },
    paymentConfirmed: { type: Boolean, default: false },
    deliveryAddress: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);