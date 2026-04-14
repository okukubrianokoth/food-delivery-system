import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setPreviewUrl('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/forgot-password', { email: email.toLowerCase() });
      setMessage(data.message || 'Password reset instructions sent.');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-xl bg-white">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Forgot Password</h2>
      <p className="text-center text-gray-600 mb-6">Enter your email and we will send a reset link.</p>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-4">{message}</div>}
      {previewUrl && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 p-4 rounded mb-4 break-words">
          <p className="font-semibold mb-2">Preview reset link</p>
          <a href={previewUrl} className="text-orange-600 hover:underline" target="_blank" rel="noreferrer">
            {previewUrl}
          </a>
        </div>
      )}
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordScreen;
