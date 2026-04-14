import { useEffect, useState } from "react";
import { getAllFoods } from "../services/foodService";
import FoodCard from "../components/FoodCard";
import { Link } from "react-router-dom";

const Menu = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const data = await getAllFoods();
        setFoods(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFoods();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      <div className="flex flex-wrap justify-start gap-4">
        {foods.map((food) => (
          <Link key={food._id} to={`/food/${food._id}`}>
            <FoodCard food={food} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;