// Optional free external food API
import axios from "axios";
export const fetchExternalFoods = async () => {
  const response = await axios.get("https://api.sampleapis.com/recipes/recipes");
  return response.data;
};