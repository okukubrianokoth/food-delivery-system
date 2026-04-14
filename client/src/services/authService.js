import API from "./api";

export const login = async (email, password) => {
  const { data } = await API.post("/api/auth/login", { email, password });
  if (data.token) {
    localStorage.setItem("userInfo", JSON.stringify(data));
  }
  return data;
};

export const register = async (name, email, password, phoneNumber) => {
  const { data } = await API.post("/api/auth/register", { name, email, password, phoneNumber });
  return data;
};

export const verifyOTP = async (email, otp) => {
  const { data } = await API.post("/api/auth/verify", { email, otp });
  if (data.token) {
    localStorage.setItem("userInfo", JSON.stringify(data));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem("userInfo");
  window.location.href = "/login";
};

export const getStoredUser = () => {
  const user = localStorage.getItem("userInfo");
  return user ? JSON.parse(user) : null;
};