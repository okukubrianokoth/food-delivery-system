import axios from '../axiosConfig.js';

export const autocompletePlaces = async (input) => {
  const { data } = await axios.get('/api/maps/autocomplete', {
    params: { input },
  });
  return data;
};

export const getPlaceDetails = async (placeId) => {
  const { data } = await axios.get('/api/maps/details', {
    params: { placeId },
  });
  return data;
};
