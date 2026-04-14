import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const initialPreviewUrl = location.state?.previewUrl || '';

  useEffect(() => {
    setPreviewUrl(initialPreviewUrl);
  }, [initialPreviewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/verify', { email, otp });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      const { data } = await axios.post('/api/auth/resend-otp', { email });
      setMessage(data.message);
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (!email) return <p className="text-center mt-20">Session expired. Please register again.</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
      <p className="text-center mb-4 text-gray-600">Please enter the OTP sent to {email}</p>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
      {previewUrl && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 p-4 rounded mb-4 break-words">
          <p className="font-semibold mb-2">OTP preview link</p>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
            {previewUrl}
          </a>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input 
            type="text" 
            className="w-full border p-3 text-center text-2xl tracking-widest rounded" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            maxLength="6"
            required 
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Verify & Login</button>
      </form>
      <div className="mt-4 text-center">
        <button 
          onClick={handleResend} 
          className="text-indigo-600 hover:underline text-sm"
        >
          Didn't receive a code? Resend
        </button>
      </div>
    </div>
  );
};

export default OTPScreen;