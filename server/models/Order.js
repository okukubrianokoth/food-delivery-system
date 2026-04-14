import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    phoneNumber: { type: String },
    status: { type: String, default: "Pending" },
    mpesaRequestId: { type: String },
    paymentConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);