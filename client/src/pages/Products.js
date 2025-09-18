import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Products = () => {
  const [params] = useSearchParams();
  const destinationId = params.get('destinationId');
  const { api, user } = useAuth();

  const { data, isLoading } = useQuery(
    ['products', destinationId],
    () => api.get('/products', { params: { destinationId } }),
    { enabled: true }
  );

  const products = data?.data?.data?.products || [];

  const book = async (productId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 2);
      const payload = {
        product: productId,
        details: {
          quantity: 1,
          startDate: startDate.toISOString(),
          participants: { adults: 1, children: 0 }
        },
        payment: { method: 'cash' }
      };
      await api.post('/bookings', payload);
      window.location.href = '/tourist/bookings';
    } catch (e) {
      alert(e?.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
          {destinationId && (
            <span className="badge-primary">Filtered by destination</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <div key={p._id} className="card-hover">
                <img src={p.primaryImage || p.images?.[0]?.url} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{p.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-primary-600 font-semibold">₹{p.price?.amount} <span className="text-xs text-gray-500">{p.price?.unit?.replace('_', ' ')}</span></div>
                    <button onClick={() => book(p._id)} className="btn-primary text-sm px-4 py-2">Book</button>
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

export default Products;
