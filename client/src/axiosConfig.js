import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

axiosInstance.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  const userInfo = storedUser ? JSON.parse(storedUser) : null;

  if (userInfo?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }

  return config;
});

export default axiosInstance;