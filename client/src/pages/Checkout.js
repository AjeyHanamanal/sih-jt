import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [paying, setPaying] = useState(false);

  const destinationId = qp.get('destinationId') || '';
  const name = qp.get('name') || 'Ticket';
  const amount = Number(qp.get('amount') || 50); // INR
  const qty = Number(qp.get('qty') || 1);
  const total = Math.max(1, qty) * Math.max(0, amount);

  const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

  const startPayment = async () => {
    setPaying(true);
    try {
      if (!keyId) {
        // Fallback demo: simulate success and issue a mock ticket
        setTimeout(() => {
          navigate(`/ticket?status=success&destinationId=${encodeURIComponent(destinationId)}&amount=${total}`);
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
        handler: function (response) {
          navigate(`/ticket?status=success&destinationId=${encodeURIComponent(destinationId)}&amount=${total}&payment_id=${response.razorpay_payment_id || ''}`);
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


