import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const loadScript = (src) => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const useQueryParams = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const Checkout = () => {
  const navigate = useNavigate();
  const qp = useQueryParams();
  const { api } = useAuth();
  const [paying, setPaying] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const destinationId = qp.get('destinationId') || '';
  const productId = qp.get('productId') || '';
  const name = qp.get('name') || 'Ticket';
  const amount = Number(qp.get('amount') || 50); // INR
  const qty = Number(qp.get('qty') || 1);
  const total = Math.max(1, qty) * Math.max(0, amount);

  const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

  const startPayment = async () => {
    setPaying(true);
    try {
      // Create booking first if it's a product purchase
      let currentBookingId = bookingId;
      if (productId && !currentBookingId) {
        try {
          const bookingData = {
            productId,
            quantity: qty,
            startDate: new Date().toISOString(),
            amount: total
          };
          
          const response = await api.post('/bookings/create-from-product', bookingData);
          currentBookingId = response.data.data.booking._id;
          setBookingId(currentBookingId);
        } catch (error) {
          console.error('Failed to create booking:', error);
          alert('Failed to create booking. Please try again.');
          setPaying(false);
          return;
        }
      }

      if (!keyId) {
        // Fallback demo: simulate success and confirm payment
        setTimeout(async () => {
          if (currentBookingId) {
            try {
              await api.put(`/bookings/${currentBookingId}/confirm-payment`, {
                paymentId: 'demo-payment-' + Date.now(),
                paymentMethod: 'demo'
              });
            } catch (error) {
              console.error('Failed to confirm payment:', error);
            }
          }
          navigate(`/ticket?status=success&destinationId=${encodeURIComponent(destinationId)}&amount=${total}&bookingId=${currentBookingId || ''}`);
        }, 800);
        return;
      }

      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) {
        alert('Failed to load payment SDK. Please try again.');
        setPaying(false);
        return;
      }

      const options = {
        key: keyId,
        amount: total * 100, // paise
        currency: 'INR',
        name: 'Jharkhand Tourism',
        description: `${name} Ticket`,
        handler: async function (response) {
          // Confirm payment for the booking
          if (currentBookingId) {
            try {
              await api.put(`/bookings/${currentBookingId}/confirm-payment`, {
                paymentId: response.razorpay_payment_id,
                paymentMethod: 'razorpay'
              });
            } catch (error) {
              console.error('Failed to confirm payment:', error);
            }
          }
          navigate(`/ticket?status=success&destinationId=${encodeURIComponent(destinationId)}&amount=${total}&payment_id=${response.razorpay_payment_id || ''}&bookingId=${currentBookingId || ''}`);
        },
        modal: {
          ondismiss: () => setPaying(false)
        },
        prefill: {},
        theme: { color: '#10b981' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error('Payment init error:', e);
      setPaying(false);
    }
  };

  useEffect(() => {
    // Auto-start for a smoother flow
    // Do not auto when no amount
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-4">{name}{destinationId ? ` • #${destinationId.slice(0, 6)}` : ''}</p>
        <div className="mb-4">
          <div className="text-sm text-gray-500">Amount</div>
          <div className="text-3xl font-bold">₹{total}</div>
        </div>
        <button onClick={startPayment} disabled={paying} className={`btn-primary w-full ${paying ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {paying ? 'Processing…' : 'Pay Now'}
        </button>
        {!keyId && (
          <div className="mt-4 text-xs text-gray-500">Using demo mode (no real charge). Set <code>REACT_APP_RAZORPAY_KEY_ID</code> to enable live checkout.</div>
        )}
      </div>
    </div>
  );
};

export default Checkout;


