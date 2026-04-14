import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      const { data } = await axios.get('/api/foods/top');
      setFeatured(data);
    };
    fetchTop();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <header className="bg-orange-100 p-12 rounded-3xl text-center mb-12">
        <h1 className="text-5xl font-extrabold text-orange-600 mb-4">Delicious Food Delivered</h1>
        <p className="text-xl text-gray-700">Explore the best meals in town, just a click away.</p>
        <Link to="/menu" className="mt-6 inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-bold">Browse Menu</Link>
      </header>

      <h2 className="text-3xl font-bold mb-8">Featured Meals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map(food => (
          <div key={food._id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img src={food.image} alt={food.name} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg">{food.name}</h3>
              <p className="text-orange-600 font-bold">${food.price}</p>
              <Link to={`/food/${food._id}`} className="text-blue-500 text-sm mt-2 block">View Details →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;