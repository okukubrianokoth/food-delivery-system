const FoodCard = ({ food }) => {
  return (
    <div className="flex items-center gap-4 border p-4 rounded shadow hover:shadow-lg transition bg-white">
      <img
        src={food.image}
        alt={food.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{food.name}</h2>
        <p className="text-gray-600 text-sm line-clamp-2">{food.shortDescription}</p>
        <p className="mt-2 font-bold text-orange-600">${food.price}</p>
      </div>
    </div>
  );
};

export default FoodCard;