import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { notificationService } from '../services/notificationService';
import axios from '../axiosConfig.js';
import { useNavigate } from 'react-router-dom';
import { autocompletePlaces, getPlaceDetails } from '../services/mapService.js';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const navigate = useNavigate();
  const controllerRef = useRef(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const normalizeMpesaNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      return `254${digits.slice(1)}`;
    }
    if (digits.startsWith('254') && digits.length === 12) {
      return digits;
    }
    if (digits.startsWith('7') && digits.length === 9) {
      return `254${digits}`;
    }
    if (digits.startsWith('254') && digits.length === 12) {
      return digits;
    }
    return digits;
  };

  const isValidMpesaNumber = (value) => {
    const normalized = normalizeMpesaNumber(value);
    return /^2547\d{8}$/.test(normalized);
  };

  const fallbackAddresses = [
    { place_id: 'fallback-gateb-juja', description: 'Gate B Juja' },
    { place_id: 'fallback-gateb-nyayo', description: 'Gate B Nyayo Stadium' },
    { place_id: 'fallback-gatea-jkuat', description: 'Gate A JKUAT' },
    { place_id: 'fallback-gateb-gsu', description: 'Gate B GSU' },
    { place_id: 'fallback-tiwiroad', description: 'Tiwi Road, Nairobi' },
    { place_id: 'fallback-juja-town', description: 'Juja Town Centre' },
    { place_id: 'fallback-nyayo-gateb', description: 'Nyayo Stadium Gate B' },
    { place_id: 'fallback-kahawa-sukari', description: 'Kahawa Sukari Gate B' },
    { place_id: 'fallback-gateb-thika', description: 'Gate B Thika Road' },
  ];

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!deliveryAddress || deliveryAddress.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await autocompletePlaces(deliveryAddress);
        const apiSuggestions = data.predictions || [];
        if (apiSuggestions.length > 0) {
          setSuggestions(apiSuggestions);
        } else {
          setSuggestions(
            fallbackAddresses.filter((address) =>
              address.description.toLowerCase().includes(deliveryAddress.toLowerCase())
            )
          );
        }
        setShowSuggestions(true);
      } catch (error) {
        console.error('Autocomplete fetch failed:', error);
        setSuggestions(
          fallbackAddresses.filter((address) =>
            address.description.toLowerCase().includes(deliveryAddress.toLowerCase())
          )
        );
        setShowSuggestions(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [deliveryAddress]);

  const handleSuggestionSelect = async (suggestion) => {
    setDeliveryAddress(suggestion.description);
    setSelectedPlaceId(suggestion.place_id);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const detailsData = await getPlaceDetails(suggestion.place_id);
      const location = detailsData.result?.geometry?.location;
      if (location) {
        setDeliveryCoords({ latitude: location.lat, longitude: location.lng });
      }
    } catch (error) {
      console.error('Place details fetch failed:', error);
      setDeliveryCoords(null);
    }
  };

  const handleAddressChange = (value) => {
    setDeliveryAddress(value);
    setSelectedPlaceId(null);
    setDeliveryCoords(null);
  };

  // Calculate total amount from cart
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePayment = async () => {
    if (!phoneNumber || !fullName || !deliveryAddress) {
      setMessage('Please fill in all required fields (phone number, full name, and delivery address).');
      return;
    }

    if (!isValidMpesaNumber(phoneNumber)) {
      setMessage('Please enter a valid M-Pesa number in the format 2547XXXXXXXX or 07XXXXXXXX.');
      return;
    }

    const normalizedPhoneNumber = normalizeMpesaNumber(phoneNumber);
    const paymentAmount = Math.round(totalAmount);

    if (paymentAmount <= 0) {
      setMessage('Order total must be greater than 0 to proceed with payment.');
      return;
    }

    setLoading(true);
    setMessage('Processing your payment request...');
    controllerRef.current = new AbortController();
    try {
      // Create order with enhanced delivery details
      const { data: orderData } = await axios.post('/api/orders', {
        orderItems: cart,
        totalPrice: totalAmount,
        phoneNumber: normalizedPhoneNumber,
        fullName: fullName,
        deliveryAddress: deliveryAddress,
        deliveryNotes: deliveryNotes,
        deliveryLocation: deliveryCoords
      }, {
        signal: controllerRef.current.signal,
      });

      // Initiate payment
      const { data: paymentData } = await axios.post('/api/payment/stkpush', {
        orderId: orderData._id,
        amount: paymentAmount,
        phoneNumber: normalizedPhoneNumber
      }, {
        signal: controllerRef.current.signal,
      });

      // Send notification
      notificationService.orderPlaced(orderData._id);

      setMessage('Please check your phone for the M-Pesa prompt.');
      console.log('Payment Response:', paymentData);
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderId: orderData._id,
          total: totalAmount,
          phoneNumber,
          fullName,
          deliveryAddress,
          mpesaResponse: paymentData.response || paymentData,
        },
      });
    } catch (error) {
      if (axios.isCancel(error) || error.name === 'CanceledError') {
        setMessage('Payment was cancelled. Your cart is still available.');
      } else {
        setMessage(error.response?.data?.message || 'Payment initiation failed');
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (loading) {
      setConfirmCancel(true);
      return;
    }

    navigate('/cart');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to proceed to checkout.</p>
          <a href="/login" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Your cart is empty. Please add items to your cart to checkout.</p>
          <a href="/menu" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
            Browse Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-xl mt-8">
      <h1 className="text-4xl font-bold mb-6 text-slate-900">Finalize Your Order</h1>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item._id || item.cartId} className="flex items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={item.image || item.photoUrl || 'https://via.placeholder.com/400?text=No+Image'}
                        alt={item.name || item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.name || item.title}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-orange-600">KSh {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
              <p className="text-lg text-slate-700">Total</p>
              <p className="text-3xl font-bold text-orange-600">KSh {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
          <h2 className="text-2xl font-semibold mb-4">Delivery & Payment Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-lg font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label htmlFor="mpesaPhoneNumber" className="block text-lg font-medium text-slate-700 mb-2">
                M-Pesa Phone Number *
              </label>
              <input
                type="text"
                id="mpesaPhoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 254712345678"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="deliveryAddress" className="block text-lg font-medium text-slate-700 mb-2">
                Delivery Address *
              </label>
              <input
                type="text"
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Start typing your delivery address..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer px-4 py-3 text-slate-800 hover:bg-slate-100"
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="deliveryNotes" className="block text-lg font-medium text-slate-700 mb-2">
                Delivery Notes (Optional)
              </label>
              <textarea
                id="deliveryNotes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handlePayment}
              disabled={loading || cart.length === 0 || !phoneNumber || !fullName || !deliveryAddress}
              className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-white font-semibold shadow-lg transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {loading ? 'Processing...' : 'Pay with M-Pesa'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-700 font-semibold shadow-sm transition hover:bg-slate-100"
            >
              {loading ? 'Cancel Payment' : 'Back to Cart'}
            </button>
          </div>
          {message && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm border border-slate-200">{message}</p>}
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-3">Cancel Payment?</h2>
            <p className="text-slate-600 mb-6">Your cart will remain intact if you stop the payment process. Do you want to return to the cart?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (controllerRef.current) {
                    controllerRef.current.abort();
                    setLoading(false);
                    setMessage('Payment process cancelled. Your cart is still available.');
                  }
                  setConfirmCancel(false);
                  navigate('/cart');
                }}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
              >
                Yes, cancel payment
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                No, continue payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;