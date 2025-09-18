import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyBookings = () => {
  const { api } = useAuth();

  const { data, isLoading, refetch } = useQuery(
    ['seller-bookings'],
    async () => {
      const res = await api.get('/bookings', { params: { limit: 50 } });
      return res.data?.data?.bookings || [];
    },
    { refetchOnWindowFocus: false }
  );

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      refetch();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">No customer bookings yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((b) => (
              <div key={b._id} className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                  <span className="badge-primary capitalize">{b.status}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{b.product?.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Qty: {b.details?.quantity} • {new Date(b.details?.startDate).toLocaleDateString()}</p>
                <div className="text-primary-600 font-semibold mb-3">₹{b.pricing?.totalAmount}</div>
                <div className="flex items-center gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(b._id, 'confirmed')} className="btn-primary text-sm px-3 py-2">Confirm</button>
                      <button onClick={() => updateStatus(b._id, 'cancelled')} className="btn-outline text-sm px-3 py-2">Cancel</button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b._id, 'completed')} className="btn-primary text-sm px-3 py-2">Mark Completed</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
