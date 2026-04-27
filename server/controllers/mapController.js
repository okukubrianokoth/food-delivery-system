export const autocomplete = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) return res.status(400).json({ message: 'Input required' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Google Maps API key not configured' });

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:ke&types=address`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Google Maps Autocomplete Error:', error);
    res.status(500).json({ message: 'Failed to fetch location suggestions' });
  }
};

export const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ message: 'placeId required' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Google Maps API key not configured' });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Google Maps Place Details Error:', error);
    res.status(500).json({ message: 'Failed to fetch place details' });
  }
};
