import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { notificationService } from '../services/notificationService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext); // Get cart and clearCart from CartContext
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || ''); // Pre-fill with user's number
  const navigate = useNavigate();
  const controllerRef = useRef(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);


  // Calculate total amount from cart
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = async () => {
    if (!phoneNumber) {
      setMessage('Please enter your M-Pesa phone number.');
      return;
    }
    setLoading(true);
    setMessage('Processing your payment request...');
    controllerRef.current = new AbortController();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`, // Ensure user and token exist
        },
        signal: controllerRef.current.signal,
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
      
      // Send notification
      notificationService.orderPlaced(orderData._id);
      
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
      if (axios.isCancel(error) || error.name === 'CanceledError') {
        setMessage('Payment was cancelled. Your cart is still available.');
      } else {
        setMessage(error.response?.data?.message || 'Payment initiation failed');
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (loading) {
      setConfirmCancel(true);
      return;
    }

    navigate('/cart');
  };

  if (!user) {
    return <p className="text-center mt-20">Please log in to proceed to checkout.</p>;
  }

  if (cart.length === 0) {
    return <p className="text-center mt-20">Your cart is empty. Please add items to your cart to checkout.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-xl mt-8">
      <h1 className="text-4xl font-bold mb-6 text-slate-900">Finalize Your Order</h1>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item._id || item.cartId} className="flex items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={item.image || item.photoUrl || 'https://via.placeholder.com/400?text=No+Image'}
                        alt={item.name || item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.name || item.title}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-orange-600">KSh {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
              <p className="text-lg text-slate-700">Total</p>
              <p className="text-3xl font-bold text-orange-600">KSh {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
          <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
          <label htmlFor="mpesaPhoneNumber" className="block text-lg font-medium text-slate-700 mb-2">
            M-Pesa Phone Number
          </label>
          <input
            type="text"
            id="mpesaPhoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 254712345678"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <div className="mt-6 flex flex-col gap-3">
            <button 
              onClick={handlePayment}
              disabled={loading || cart.length === 0 || !phoneNumber}
              className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-white font-semibold shadow-lg transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {loading ? 'Processing...' : 'Pay with M-Pesa'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-700 font-semibold shadow-sm transition hover:bg-slate-100"
            >
              {loading ? 'Cancel Payment' : 'Back to Cart'}
            </button>
          </div>
          {message && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm border border-slate-200">{message}</p>}
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-3">Cancel Payment?</h2>
            <p className="text-slate-600 mb-6">Your cart will remain intact if you stop the payment process. Do you want to return to the cart?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (controllerRef.current) {
                    controllerRef.current.abort();
                    setLoading(false);
                    setMessage('Payment process cancelled. Your cart is still available.');
                  }
                  setConfirmCancel(false);
                  navigate('/cart');
                }}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
              >
                Yes, cancel payment
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                No, continue payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;