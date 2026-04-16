import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="bg-orange-100 p-12 rounded-3xl text-center mb-12">
        <h1 className="text-5xl font-extrabold text-orange-600 mb-4">Delicious Food Delivered</h1>
        <p className="text-xl text-gray-700">Explore the best meals in town, just a click away.</p>
        <Link to="/menu" className="mt-6 inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-bold">Browse Menu</Link>
      </header>
    </div>
  );
};

export default Home;