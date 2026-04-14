import API from "./api";

export const getAllFoods = async () => {
  const response = await API.get("/api/foods");
  return response.data;
};

export const getFoodById = async (id) => {
  const response = await API.get(`/api/foods/${id}`);
  return response.data;
};

export const createFood = async (foodData) => {
  const response = await API.post("/api/foods", foodData);
  return response.data;
};

export const updateFood = async (id, foodData) => {
  const response = await API.put(`/api/foods/${id}`, foodData);
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await API.delete(`/api/foods/${id}`);
  return response.data;
};