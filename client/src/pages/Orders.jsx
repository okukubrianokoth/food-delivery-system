import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (loading) return <p className="text-center mt-20">Loading your orders...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow-sm bg-white">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <p className="font-bold text-lg">Order #{order._id.slice(-6)}</p>
                  <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-gray-700">Status: <span className={`font-semibold ${order.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.status}</span></p>
                  <p className="mt-1 text-sm text-gray-700">Payment: <span className={`font-semibold ${order.paymentConfirmed ? 'text-green-600' : 'text-yellow-700'}`}>{order.paymentConfirmed ? 'Confirmed' : 'Pending'}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">{order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;