import axios from '../axiosConfig';

const API_BASE_URL = '/api/orders';

// Get all orders for the current user
export const getUserOrders = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

// Get a specific order by ID
export const getOrderById = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/${orderId}`);
  return response.data;
};

// Create a new order
export const createOrder = async (orderData) => {
  const response = await axios.post(API_BASE_URL, orderData);
  return response.data;
};

// Update order status (admin/driver function)
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(`${API_BASE_URL}/${orderId}/status`, { status });
  return response.data;
};

// Get all orders (admin function)
export const getAllOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/all`);
  return response.data;
};

// Assign driver to order (admin function)
export const assignDriverToOrder = async (orderId, driverId) => {
  const response = await axios.put(`${API_BASE_URL}/${orderId}/assign-driver`, { driverId });
  return response.data;
};

// Update delivery location (driver function)
export const updateDeliveryLocation = async (orderId, location) => {
  const response = await axios.put(`${API_BASE_URL}/${orderId}/location`, { location });
  return response.data;
};
