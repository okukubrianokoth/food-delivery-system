import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import axios from '../axiosConfig.js';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import ExternalReviewWidget from '../components/ExternalReviewWidget.jsx';

const FoodDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const fetchFood = useCallback(async () => {
    try {
      // Check if food data was passed through query parameters (for external foods)
      const foodData = searchParams.get('data');
      if (foodData) {
        const parsedFood = JSON.parse(decodeURIComponent(foodData));
        setFood(parsedFood);
      } else if (id) {
        // Fetch local food by ID
        const { data } = await axios.get(`/api/foods/${id}`);
        setFood(data);
      } else {
        // No valid food data found
        setFood(null);
      }
    } catch (error) {
      console.error(error);
      setFood(null);
    } finally {
      setLoading(false);
    }
  }, [id, searchParams]);

  useEffect(() => {
    fetchFood();
  }, [fetchFood]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to leave a review.');
      return;
    }
    
    if (food._id) {
      // Local food review
      try {
        await axios.post(`/api/foods/${food._id}/reviews`, { rating, comment });
        alert('Review submitted!');
        fetchFood();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to submit review');
      }
    } else {
      // External food review - handled by ExternalReviewWidget
      alert('Review submitted!');
      setComment('');
      setRating(5);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!food) return <div className="text-center mt-20">Food not found</div>;

  const imageUrl = food.image || food.photoUrl || 'https://via.placeholder.com/400?text=No+Image';
  const title = food.name || food.title || 'Delicious Meal';
  const description = food.description || food.shortDescription || food.course || 'Tasty and fresh.';
  const price = food.price || 'N/A';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full rounded-lg shadow-lg object-cover h-80" 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />
        <div>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-green-600 text-2xl font-semibold mb-4">KSh {price}</p>
          <p className="text-gray-700 mb-6">{description}</p>
          <button 
            onClick={() => addToCart(food)}
            className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        
        {/* External Review Widget for external foods */}
        {food._id && (food._id.startsWith('sample-') || food._id.startsWith('meal-') || food._id.startsWith('cocktail-')) && <ExternalReviewWidget food={food} />}
        
        {/* Local food reviews */}
        {food._id && !(food._id.startsWith('sample-') || food._id.startsWith('meal-') || food._id.startsWith('cocktail-')) && food.reviews && food.reviews.length > 0 ? (
          food.reviews.map((r) => (
            <div key={r._id} className="border-b py-4">
              <p className="font-bold">{r.name} <span className="text-yellow-500">{'★'.repeat(r.rating)}</span></p>
              <p className="text-gray-600">{r.comment}</p>
            </div>
          ))
        ) : food._id && !(food._id.startsWith('sample-') || food._id.startsWith('meal-') || food._id.startsWith('cocktail-')) && (
          <p className="text-gray-600">No reviews yet. Be the first to leave feedback!</p>
        )}
        
        {/* Review form only for local foods */}
        {!food._id || (!(food._id.startsWith('sample-') || food._id.startsWith('meal-') || food._id.startsWith('cocktail-'))) ? (
          user ? (
            <form onSubmit={submitReview} className="mt-8 bg-gray-50 p-6 rounded shadow-inner">
              <h3 className="font-bold mb-2">Leave a Review</h3>
              <select 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                className="block w-full mb-4 p-2 border"
              >
                {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
              </select>
              <textarea 
                className="w-full p-2 border mb-4" 
                placeholder="Your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </form>
          ) : (
            <p className="mt-4 text-gray-600">Please log in to leave a review.</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default FoodDetails;