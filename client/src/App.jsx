import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders.jsx";
import Admin from "./pages/Admin";
import UserProfile from "./pages/UserProfile.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import DeliveryTracker from "./pages/DeliveryTracker";

// Auth Screens
import LoginScreen from "./services/LoginScreen.jsx";
import RegisterScreen from "./services/RegisterScreen.jsx";
import OTPScreen from "./services/OTPScreen.jsx";
import ForgotPasswordScreen from "./services/ForgotPasswordScreen.jsx";
import ResetPasswordScreen from "./services/ResetPasswordScreen.jsx";

// PrivateRoute Component
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = React.useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-confirmation"
                element={
                  <PrivateRoute>
                    <OrderConfirmation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/delivery-tracker/:orderId"
                element={
                  <PrivateRoute>
                    <DeliveryTracker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly={true}>
                    <Admin />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/verify-otp" element={<OTPScreen />} />
              <Route path="*" element={<div className="text-center mt-20">404 Not Found</div>} />
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;