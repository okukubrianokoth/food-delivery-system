import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const STORAGE_KEY = "externalFoodReviews";

const ExternalReviewWidget = ({ food }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const itemKey = `${food.source}-${food._id || food.name || food.title}`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setReviews(parsed[itemKey] || []);
    }
  }, [itemKey]);

  const saveReviews = (nextReviews) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[itemKey] = nextReviews;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setReviews(nextReviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to leave a review.");
      return;
    }
    if (!comment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    const nextReviews = [
      {
        name: user.name || user.email || "Guest",
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      },
      ...reviews,
    ];

    saveReviews(nextReviews);
    setComment("");
    setRating(5);
    setShowForm(false);
  };

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="text-amber-500">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  if (!food.source || food.source === "local") return null;

  return (
    <div className="external-review-widget mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold">{reviews.length ? `Reviews (${reviews.length})` : "No reviews yet"}</p>
          {averageRating && (
            <div className="flex items-center gap-1">
              {renderStars(Number(averageRating))}
              <span className="text-slate-600 text-xs">({averageRating})</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-orange-500 px-3 py-1 text-white hover:bg-orange-600 transition"
        >
          {showForm ? "Close" : "Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} Stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Share your thoughts"
            />
          </div>
          <button type="submit" className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">
            Submit Review
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <div className="mt-4 space-y-2">
          {reviews.slice(0, 2).map((review, index) => (
            <div key={`${itemKey}-${index}`} className="rounded border border-slate-200 bg-white p-3">
              <p className="font-semibold">{review.name}</p>
              <p className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
              <p className="text-slate-700 mt-1">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalReviewWidget;
