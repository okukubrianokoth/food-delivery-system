import axios from 'axios';
import dotenv from 'dotenv';
import moment from 'moment';
import Order from '../models/Order.js';

dotenv.config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY,
  MPESA_SHORTCODE,
  MPESA_CALLBACK_URL,
  NODE_ENV
} = process.env;

const MPESA_BASE_URL = NODE_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

// Function to get M-Pesa OAuth Access Token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Function to initiate STK Push
export const stkPush = async (phoneNumber, amount, orderId) => {
  try {
    const accessToken = await getAccessToken();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline', // Or CustomerBuyGoodsOnline
      Amount: amount,
      PartyA: phoneNumber, // Customer's phone number
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `FoodDelivery-${orderId || 'Guest'}`, // Unique identifier for the transaction
      TransactionDesc: 'Food Order Payment',
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update order with the CheckoutRequestID for callback reconciliation
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { mpesaRequestId: response.data.CheckoutRequestID });
    }

    return response.data;
  } catch (error) {
    console.error('Error initiating STK Push:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.CustomerMessage || 'Failed to initiate STK Push');
  }
};

// Function to handle M-Pesa callback (will be called by Daraja API)
export const mpesaCallback = async (callbackData) => {
  console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

  const { Body: { stkCallback } } = callbackData;
  const { ResultCode, MerchantRequestID, CheckoutRequestID } = stkCallback;

  // ResultCode 0 means success
  if (ResultCode === 0) {
    // Match the order using the CheckoutRequestID sent by Safaricom
    await Order.findOneAndUpdate(
      { mpesaRequestId: CheckoutRequestID },
      { status: "Paid", paymentConfirmed: true }
    );
    console.log(`Payment successful for Request: ${CheckoutRequestID}`);
  } else {
    console.error(`Payment failed with code ${ResultCode}`);
  }
};