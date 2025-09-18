import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const useQuery = () => new URLSearchParams(useLocation().search);

const Ticket = () => {
  const q = useQuery();
  const status = q.get('status') || 'success';
  const dest = q.get('destinationId') || '';
  const amount = q.get('amount') || '0';
  const pid = q.get('payment_id') || '';
  const qrPayload = encodeURIComponent(JSON.stringify({ status, dest, amount, pid, ts: Date.now() }));
  const qrOverride = q.get('qr');
  const qrUrl = qrOverride || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrPayload}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">{status === 'success' ? 'Payment Successful' : 'Payment'}</h1>
        <p className="text-gray-600 mb-4">Your e-ticket has been generated.</p>
        <div className="flex items-center justify-center mb-4">
          <img src={qrUrl} alt="Ticket QR" className="h-44 w-44 border rounded" />
        </div>
        <div className="text-left text-sm bg-gray-50 border rounded p-4 space-y-1">
          <div><span className="text-gray-500">Destination ID:</span> {dest || 'N/A'}</div>
          <div><span className="text-gray-500">Amount:</span> ₹{amount}</div>
          {pid && <div><span className="text-gray-500">Payment ID:</span> {pid}</div>}
        </div>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/" className="btn-outline">Home</Link>
          <Link to="/destinations" className="btn-primary">Explore More</Link>
        </div>
        <div className="mt-3 text-xs text-gray-500">Scan QR at the entry gate to validate your ticket.</div>
      </div>
    </div>
  );
};

export default Ticket;


