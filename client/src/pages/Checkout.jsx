import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext); // Get cart and clearCart from CartContext
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || ''); // Pre-fill with user's number
  const navigate = useNavigate();

  // Calculate total amount from cart
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = async () => {
    if (!phoneNumber) {
      setMessage('Please enter your M-Pesa phone number.');
      return;
    }
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`, // Ensure user and token exist
        },
      };

      // 1. Create a real Order in the DB first
      const { data: orderData } = await axios.post('/api/orders', {
        orderItems: cart,
        totalPrice: totalAmount,
        phoneNumber: phoneNumber
      }, config);

      // 2. Pass the real Order ID to the payment service
      const { data: paymentData } = await axios.post('/api/payment/stkpush', { 
        orderId: orderData._id,
        amount: totalAmount,
        phoneNumber: phoneNumber // Send the phone number from the input
      }, config);
      
      setMessage('Please check your phone for the M-Pesa prompt.');
      console.log('Payment Response:', paymentData);
      clearCart(); // Clear cart after initiating payment
      navigate('/order-confirmation', {
        state: {
          orderId: orderData._id,
          total: totalAmount,
          phoneNumber,
          mpesaResponse: paymentData.response || paymentData,
        },
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-center mt-20">Please log in to proceed to checkout.</p>;
  }

  if (cart.length === 0) {
    return <p className="text-center mt-20">Your cart is empty. Please add items to your cart to checkout.</p>;
  }

  return (
    <div className="checkout-container">
      <h1>Finalize Your Order</h1>
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.map(item => (
          <p key={item._id}>{item.name} x {item.quantity} = ${item.price * item.quantity}</p>
        ))}
        <h3>Total: ${totalAmount.toFixed(2)}</h3>
      </div>
      <div className="payment-section">
        <label htmlFor="mpesaPhoneNumber" className="block text-lg font-medium text-gray-700 mb-2">
          M-Pesa Phone Number:
        </label>
        <input
          type="text"
          id="mpesaPhoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., 254712345678"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button 
          onClick={handlePayment}
          disabled={loading || cart.length === 0 || !phoneNumber}
          className="btn-pay"
        >
          {loading ? 'Processing...' : 'Pay with M-Pesa'}
        </button>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
};

export default Checkout;