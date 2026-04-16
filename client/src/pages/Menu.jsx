import { useEffect, useState } from "react";
import { getAllFoods, getExternalFoods } from "../services/foodService";
import FoodCard from "../components/FoodCard";
import { Link } from "react-router-dom";

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const [localFoods, externalFoods] = await Promise.all([
          getAllFoods(),
          getExternalFoods().catch(() => []) // Fallback to empty array if external API fails
        ]);
        
        // Combine both local and external foods
        const combinedFoods = [...localFoods, ...(externalFoods || [])];
        setFoods(combinedFoods);
      } catch (err) {
        console.error("Error fetching foods:", err);
        // Still show local foods even if external fails
        try {
          const localFoods = await getAllFoods();
          setFoods(localFoods);
        } catch (internalErr) {
          console.error("Error fetching local foods:", internalErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const filteredFoods = foods.filter(food => {
    if (activeFilter === "all") return true;
    if (activeFilter === "local") return !food.source;
    return food.source === activeFilter;
  });

  const filterOptions = [
    { key: "all", label: "All Foods", count: foods.length },
    { key: "local", label: "Local Menu", count: foods.filter(f => !f.source).length },
    { key: "sampleapis", label: "SampleAPI", count: foods.filter(f => f.source === "sampleapis").length },
    { key: "mealdb", label: "MealDB", count: foods.filter(f => f.source === "mealdb").length },
    { key: "cocktaildb", label: "CocktailDB", count: foods.filter(f => f.source === "cocktaildb").length },
  ];

  if (loading) return <div className="container mx-auto p-4 text-center">Loading menu...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Menu</h1>
      
      {/* Filter Tabs */}
      <div className="menu-filters">
        {filterOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            className={`menu-filter-btn ${activeFilter === option.key ? 'active' : ''}`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {filteredFoods.length === 0 ? (
        <p className="text-gray-500">No foods available in this category.</p>
      ) : (
        <div className="foods-container">
          {filteredFoods.map((food) => (
            // All foods are now clickable - local foods use ID, external foods use query params
            food._id && (food._id.startsWith('sample-') || food._id.startsWith('meal-') || food._id.startsWith('cocktail-')) ? (
              <Link 
                key={`external-${food._id}`} 
                to={`/food/external-food?data=${encodeURIComponent(JSON.stringify(food))}`}
                className="food-item"
              >
                <FoodCard food={food} />
              </Link>
            ) : (
              <Link key={food._id} to={`/food/${food._id}`} className="food-item">
                <FoodCard food={food} />
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;