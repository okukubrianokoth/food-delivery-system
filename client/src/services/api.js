// client/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

// Add a request interceptor to attach the JWT token automatically
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")) 
    : null;

  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default API;