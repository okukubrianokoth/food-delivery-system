import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const total = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty. Browse the menu and add some food!</p>
      ) : (
        <>
          <div className="flex flex-wrap justify-start gap-3 mb-6">
            {cart.map(item => (
              <div key={item._id || item.cartId} className="w-28 border rounded-lg bg-white p-2 flex flex-col">
                <img
                  src={item.image || item.photoUrl || 'https://via.placeholder.com/400?text=No+Image'}
                  alt={item.name || item.title}
                  className="w-full h-20 object-cover rounded mb-2"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                />
                <h3 className="font-semibold text-xs line-clamp-2">{item.name || item.title}</h3>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                <p className="text-xs text-gray-700 mb-1">KSh {item.price.toFixed(2)}</p>
                {item.source && (
                  <span className="text-xs bg-gray-100 px-1 py-0.5 rounded mb-1">{item.source}</span>
                )}
                <p className="text-xs font-semibold text-orange-600 mb-1">KSh {(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item._id || item.cartId)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="mb-4">
              <p className="text-lg font-semibold">Order Total</p>
              <p className="text-3xl font-bold text-orange-600">KSh {total.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/checkout" className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700">
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;