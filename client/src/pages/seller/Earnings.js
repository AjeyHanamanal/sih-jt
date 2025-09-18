import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';

const Stat = ({ label, value }) => (
  <div className="card p-6 text-center">
    <div className="text-2xl font-bold text-primary-600">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const Earnings = () => {
  const { api } = useAuth();

  const { data } = useQuery(
    ['seller-analytics'],
    async () => {
      const res = await api.get('/bookings', { params: { period: '30d' } });
      const bookings = res.data?.data?.bookings || [];
      const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const revenue = confirmed.reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
      return { total: bookings.length, confirmed: confirmed.length, revenue };
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings & Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat label="Total Bookings (30d)" value={data?.total || 0} />
          <Stat label="Confirmed/Completed (30d)" value={data?.confirmed || 0} />
          <Stat label="Revenue (₹) (30d)" value={Math.round(data?.revenue || 0)} />
        </div>
      </div>
    </div>
  );
};

export default Earnings;
