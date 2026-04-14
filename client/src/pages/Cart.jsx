import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty. Browse the menu and add some food!</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <p className="font-semibold text-lg">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="mt-2 inline-block text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg">
            <div>
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Link to="/checkout" className="inline-block text-center bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition">
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="inline-block text-center bg-red-500 text-white px-5 py-3 rounded-lg hover:bg-red-600 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;