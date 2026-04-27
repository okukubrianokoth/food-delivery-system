import axios from '../axiosConfig';

const API_BASE_URL = '/api/drivers';

// Driver authentication
export const driverLogin = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  return response.data;
};

export const driverRegister = async (driverData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, driverData);
  return response.data;
};

// Driver profile
export const getDriverProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/profile`);
  return response.data;
};

// Driver location and availability
export const updateDriverLocation = async (longitude, latitude) => {
  const response = await axios.put(`${API_BASE_URL}/location`, { longitude, latitude });
  return response.data;
};

export const updateDriverAvailability = async (isAvailable) => {
  const response = await axios.put(`${API_BASE_URL}/availability`, { isAvailable });
  return response.data;
};

// Driver orders
export const getDriverOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/orders`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(`${API_BASE_URL}/orders/status`, { orderId, status });
  return response.data;
};

// Admin functions
export const getNearbyDrivers = async (longitude, latitude, maxDistance = 5000) => {
  const response = await axios.get(`${API_BASE_URL}/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`);
  return response.data;
};

export const assignOrderToDriver = async (orderId, driverId) => {
  const response = await axios.post(`${API_BASE_URL}/assign-order`, { orderId, driverId });
  return response.data;
};