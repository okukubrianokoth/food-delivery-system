import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const total = state?.total;
  const phoneNumber = state?.phoneNumber;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4 text-green-700">Order Received</h1>
        {orderId ? (
          <>
            <p className="text-lg mb-2">Your order has been created successfully.</p>
            <p className="text-gray-700 mb-4">Order ID: <span className="font-semibold">#{orderId.slice(-6)}</span></p>
            <p className="text-gray-700 mb-4">Total amount: <span className="font-semibold">${total?.toFixed(2) ?? '0.00'}</span></p>
            <p className="text-gray-700 mb-4">Payment prompt has been sent to: <span className="font-semibold">{phoneNumber}</span></p>
            <p className="text-gray-600 mb-6">
              Please approve the M-Pesa prompt on your phone. After payment, you can review order status on the Orders page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/orders" className="bg-green-600 text-white px-5 py-3 rounded-lg text-center hover:bg-green-700 transition">
                View My Orders
              </Link>
              <Link to="/menu" className="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg text-center hover:bg-gray-300 transition">
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-4">No order data is available right now.</p>
            <Link to="/menu" className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition">
              Back to Menu
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
