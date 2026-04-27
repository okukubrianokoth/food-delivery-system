import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../axiosConfig";
import Navbar from "../components/Navbar";

const DeliveryTracker = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrderDetails, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      setOrder(response.data);

      // If order has a driver, fetch driver details
      if (response.data.driver) {
        const driverResponse = await axios.get(`/drivers/${response.data.driver}`);
        setDriver(driverResponse.data);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch order details");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      ready: "bg-purple-100 text-purple-800",
      assigned: "bg-indigo-100 text-indigo-800",
      picked_up: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "confirmed", label: "Order Confirmed", icon: "✓" },
      { key: "preparing", label: "Preparing Food", icon: "👨‍🍳" },
      { key: "ready", label: "Ready for Pickup", icon: "📦" },
      { key: "assigned", label: "Driver Assigned", icon: "🚗" },
      { key: "picked_up", label: "Picked Up", icon: "🚚" },
      { key: "delivered", label: "Delivered", icon: "✅" },
    ];

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === order?.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h1>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold">{order._id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace("_", " ").toUpperCase()}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                      index <= currentStepIndex
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p className={`text-xs text-center ${
                    index <= currentStepIndex ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Delivery Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Customer:</span> {order.fullName}</p>
                <p><span className="font-medium">Phone:</span> {order.phoneNumber}</p>
                <p><span className="font-medium">Address:</span> {order.deliveryAddress}</p>
                {order.deliveryNotes && (
                  <p><span className="font-medium">Notes:</span> {order.deliveryNotes}</p>
                )}
                {order.estimatedDeliveryTime && (
                  <p><span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>KSh {item.price * item.quantity}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>KSh {order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {driver && (order.status === "assigned" || order.status === "picked_up") && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Driver Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Name:</span> {driver.name}</p>
                  <p><span className="font-medium">Phone:</span> {driver.phoneNumber}</p>
                </div>
                <div>
                  <p><span className="font-medium">Vehicle:</span> {driver.vehicleType}</p>
                  <p><span className="font-medium">Rating:</span> ⭐ {driver.rating}/5</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Order Timeline</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
              {order.confirmedAt && <p>Confirmed: {new Date(order.confirmedAt).toLocaleString()}</p>}
              {order.pickedUpAt && <p>Picked Up: {new Date(order.pickedUpAt).toLocaleString()}</p>}
              {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;