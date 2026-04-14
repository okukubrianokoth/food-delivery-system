import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const fetchFood = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/foods/${id}`);
      setFood(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFood();
  }, [fetchFood]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to leave a review.');
      return;
    }
    try {
      await axios.post(`/api/foods/${id}/reviews`, { rating, comment });
      alert('Review submitted!');
      fetchFood();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!food) return <div className="text-center mt-20">Food not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8">
        <img 
          src={food.image} 
          alt={food.name} 
          className="w-full rounded-lg shadow-lg object-cover h-80" 
        />
        <div>
          <h1 className="text-4xl font-bold mb-2">{food.name}</h1>
          <p className="text-green-600 text-2xl font-semibold mb-4">${food.price}</p>
          <p className="text-gray-700 mb-6">{food.description}</p>
          <button 
            onClick={() => addToCart(food)}
            className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Reviews ({food.numReviews})</h2>
        {food.reviews && food.reviews.length > 0 ? (
          food.reviews.map((r) => (
            <div key={r._id} className="border-b py-4">
              <p className="font-bold">{r.name} <span className="text-yellow-500">{'★'.repeat(r.rating)}</span></p>
              <p className="text-gray-600">{r.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to leave feedback!</p>
        )}
        
        {user ? (
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
        )}
      </div>
    </div>
  );
};

export default FoodDetails;