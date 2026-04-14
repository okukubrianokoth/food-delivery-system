import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email: email.toLowerCase(), password });
      login(data);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      if (err.response?.data?.notVerified || message.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email: email.toLowerCase() } });
        return;
      }
      setError(message);
    }
  };

  const goToVerify = () => {
    if (!email) {
      setError('Please enter your email to verify your account.');
      return;
    }
    navigate('/verify-otp', { state: { email: email.toLowerCase() } });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full border p-2 rounded" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input 
            type="password" 
            className="w-full border p-2 rounded" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
      <div className="mt-4 text-center space-y-2">
        <p className="text-gray-600">New customer? <Link to="/register" className="text-blue-600">Register</Link></p>
        <button
          type="button"
          onClick={goToVerify}
          className="w-full mt-2 bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200"
        >
          Verify your account
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;