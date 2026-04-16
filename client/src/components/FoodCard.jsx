import ExternalReviewWidget from "./ExternalReviewWidget.jsx";

const placeholderImage = 'https://via.placeholder.com/300?text=No+Image';

const FoodCard = ({ food }) => {
  const imageUrl = food.image || food.photoUrl || placeholderImage;
  const title = food.name || food.title || 'Delicious Meal';
  const description = food.shortDescription || food.description || food.course || 'Tasty and fresh.';

  const sourceLabel = food.source === 'mealdb'
    ? 'MealDB'
    : food.source === 'cocktaildb'
    ? 'CocktailDB'
    : food.source === 'sampleapis'
    ? 'SampleAPI'
    : '';

  const sourceColor = food.source === 'mealdb'
    ? 'bg-blue-100 text-blue-800'
    : food.source === 'cocktaildb'
    ? 'bg-purple-100 text-purple-800'
    : food.source === 'sampleapis'
    ? 'bg-green-100 text-green-800'
    : '';

  return (
    <div className="food-card-horizontal border p-4 rounded shadow hover:shadow-lg transition bg-white w-full">
      <img
        src={imageUrl}
        alt={title}
        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="food-info flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {sourceLabel && (
            <span className={`text-xs uppercase tracking-wide px-2 py-1 rounded-full ${sourceColor}`}>
              {sourceLabel}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        <p className="mt-2 font-bold text-orange-600">KSh {food.price ?? 'N/A'}</p>
        <ExternalReviewWidget food={food} />
      </div>
    </div>
  );
};

export default FoodCard;