import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Navbar.css"; // Optional: for styling

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">FoodDelivery</Link>
      </div>

      <button
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li onClick={() => setIsOpen(false)}>
          <Link to="/">Home</Link>
        </li>
        <li onClick={() => setIsOpen(false)}>
          <Link to="/menu">Menu</Link>
        </li>
        <li onClick={() => setIsOpen(false)}>
          <Link to="/orders">Orders</Link>
        </li>
        {!user && (
          <>
            <li onClick={() => setIsOpen(false)}>
              <Link to="/login">Login</Link>
            </li>
            <li onClick={() => setIsOpen(false)}>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li onClick={() => setIsOpen(false)}>
              <Link to="/cart">Cart</Link>
            </li>
            {user.isAdmin && (
              <li onClick={() => setIsOpen(false)}>
                <Link to="/admin">Admin</Link>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;