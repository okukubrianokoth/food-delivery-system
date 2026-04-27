import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig.js';

const ResetPasswordScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';
    setEmail(emailParam);
    setToken(tokenParam);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !token) {
      setError('Invalid reset link. Please use the link from your email.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please enter your new password and confirm it.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/reset-password', {
        email: email.toLowerCase(),
        token,
        password,
      });
      setMessage('Password reset successfully. Redirecting to home...');
      window.localStorage.setItem('user', JSON.stringify(data));
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-xl bg-white">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Reset Password</h2>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="New password"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Confirm password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-600">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-orange-600 font-bold hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
