import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
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

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow-sm bg-white">
              <div 
                className="flex flex-col md:flex-row justify-between gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => toggleExpand(order._id)}
              >
                <div>
                  <p className="font-bold text-lg">Order #{order._id.slice(-6)}</p>
                  <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-gray-700">Status: <span className={`font-semibold ${order.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.status}</span></p>
                  <p className="mt-1 text-sm text-gray-700">Payment: <span className={`font-semibold ${order.paymentConfirmed ? 'text-green-600' : 'text-yellow-700'}`}>{order.paymentConfirmed ? 'Confirmed' : 'Pending'}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">KSh {order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">{order.orderItems?.length || 0} item{order.orderItems?.length === 1 ? '' : 's'}</p>
                  <p className="text-xs text-blue-600 mt-2">{expandedOrder === order._id ? '▼ Click to collapse' : '▶ Click to expand'}</p>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-3">Order Items:</h3>
                  <div className="space-y-3">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: KSh {item.price.toFixed(2)} each</p>
                          <p className="text-sm font-semibold text-gray-700 mt-1">Subtotal: KSh {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(order.deliveryAddress || order.notes) && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold mb-2">Delivery Details:</h3>
                      {order.deliveryAddress && (
                        <p className="text-sm text-gray-700 mb-2"><span className="font-semibold">Address:</span> {order.deliveryAddress}</p>
                      )}
                      {order.notes && (
                        <p className="text-sm text-gray-700"><span className="font-semibold">Notes:</span> {order.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;