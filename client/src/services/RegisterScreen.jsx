import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig.js';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = formData.email.toLowerCase();
      const { data } = await axios.post('/api/auth/register', { ...formData, email });
      navigate('/verify-otp', { state: { email, previewUrl: data.previewUrl } });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      if (err.response?.data?.previewUrl) {
        navigate('/verify-otp', { state: { email: formData.email.toLowerCase(), previewUrl: err.response.data.previewUrl } });
        return;
      }
      if (err.response?.data?.notVerified || message.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email: formData.email.toLowerCase() } });
        return;
      }
      setError(message);
    }
  };

  const goToVerify = () => {
    if (!formData.email) {
      setError('Please enter your email to verify your account.');
      return;
    }
    navigate('/verify-otp', { state: { email: formData.email.toLowerCase() } });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Full Name</label>
          <input 
            name="name" type="text" className="w-full border p-2 rounded" 
            value={formData.name} onChange={handleChange} required 
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email Address</label>
          <input 
            name="email" type="email" className="w-full border p-2 rounded" 
            value={formData.email} onChange={handleChange} required 
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone Number (M-Pesa)</label>
          <input 
            name="phoneNumber" type="text" className="w-full border p-2 rounded" 
            value={formData.phoneNumber} onChange={handleChange} required placeholder="254..."
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input 
            name="password" type="password" className="w-full border p-2 rounded" 
            value={formData.password} onChange={handleChange} required 
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Register</button>
      </form>
      <div className="mt-4 text-center space-y-2">
        <p className="text-gray-600">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
        <button
          type="button"
          onClick={goToVerify}
          className="w-full mt-2 bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200"
        >
          Verify existing account
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen;