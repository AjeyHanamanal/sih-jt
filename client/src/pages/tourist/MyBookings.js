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
      const allBookings = res.data?.data?.bookings || [];
      // Filter out cancelled bookings
      return allBookings.filter(booking => booking.status !== 'cancelled');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your booked products and services</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start exploring our amazing products and services to make your first booking!</p>
            <a href="/products" className="btn-primary">Explore Products</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((b) => (
              <div key={b._id} className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden">
                {/* Product Image */}
                {b.product?.images && b.product.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={b.product.images[0].url}
                      alt={b.product.images[0].alt || b.product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image available</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-gray-400">Booking #{b._id.slice(-8)}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {b.product?.name || 'Booking'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 capitalize">
                    {b.product?.category?.replace('_', ' ') || 'Product'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-primary-600">₹{b.pricing?.totalAmount || 0}</div>
                    {b.product?.rating && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{typeof b.product.rating === 'object' ? b.product.rating?.average || 0 : b.product.rating || 0}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {b.status === 'pending' || b.status === 'confirmed' ? (
                      <button 
                        onClick={() => cancelBooking(b._id)} 
                        className="flex-1 btn-outline text-sm px-4 py-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
                      >
                        Cancel Booking
                      </button>
                    ) : null}
                    
                    <button className="flex-1 btn-primary text-sm px-4 py-2">
                      View Details
                    </button>
                  </div>
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
