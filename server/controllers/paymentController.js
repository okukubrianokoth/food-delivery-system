import { stkPush, mpesaCallback } from "../services/mpesaService.js";
import Order from '../models/Order.js'; // Assuming you have an Order model

export const initiatePayment = async (req, res) => {
  const { orderId, amount, phoneNumber } = req.body; // Expecting orderId and amount from frontend
  const userPhoneNumber = phoneNumber || req.user.phoneNumber; // Use provided number or user's registered number

  try {
    // In a real scenario, you'd create an order in your DB first,
    // then use its ID for the AccountReference.
    // For now, we'll use the provided orderId or a placeholder.
    const response = await stkPush(userPhoneNumber, amount, orderId);
    res.json({ message: "STK Push initiated", response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment initiation failed", error: err.message });
  }
};

// This will be the endpoint M-Pesa calls back to
export const handleMpesaCallback = async (req, res) => {
  try {
    await mpesaCallback(req.body); // Process the callback data
    res.status(200).send('Callback received successfully');
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error.message);
    res.status(500).send('Error processing callback');
  }
};