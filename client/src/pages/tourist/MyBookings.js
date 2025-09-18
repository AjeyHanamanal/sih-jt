import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyBookings = () => {
  const { api } = useAuth();

  const { data, isLoading, refetch } = useQuery(
    ['my-bookings'],
    async () => {
      const res = await api.get('/bookings');
      return res.data?.data?.bookings || [];
    },
    { refetchOnWindowFocus: false }
  );

  const cancelBooking = async (id) => {
    const reason = prompt('Cancellation reason (optional)') || '';
    try {
      await api.post(`/bookings/${id}/cancel`, { reason });
      await refetch();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">No bookings yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((b) => (
              <div key={b._id} className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                  <span className="badge-primary capitalize">{b.status}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{b.product?.name || 'Booking'}</h3>
                <p className="text-sm text-gray-600 mb-3">{b.product?.category?.replace('_',' ')}</p>
                <div className="text-primary-600 font-semibold mb-3">₹{b.pricing?.totalAmount}</div>
                <div className="flex items-center gap-3">
                  {b.status === 'pending' || b.status === 'confirmed' ? (
                    <button onClick={() => cancelBooking(b._id)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                  ) : null}
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
