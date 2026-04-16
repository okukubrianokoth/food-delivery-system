/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (food, quantity = 1) => {
    // Use _id for local foods, or create a unique identifier for external foods
    const itemId = food._id || `${food.source}-${food.name || food.title}-${food.price || '0'}`;
    const existing = cart.find((item) => (item._id || `${item.source}-${item.name || item.title}-${item.price || '0'}`) === itemId);
    if (existing) {
      setCart(
        cart.map((item) =>
          (item._id || `${item.source}-${item.name || item.title}-${item.price || '0'}`) === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...food, quantity, cartId: itemId }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => (item._id || item.cartId) !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};