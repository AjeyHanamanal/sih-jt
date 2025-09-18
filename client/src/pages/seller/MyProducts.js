import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyProducts = () => {
  const { api } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, refetch, error } = useQuery(
    ['seller-products'],
    async () => {
      const res = await api.get('/products/seller/my-products', { params: { limit: 50 } });
      return res.data?.data?.products || [];
    },
    { refetchOnWindowFocus: false }
  );

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      refetch();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  };

  // Handle auth errors
  if (error?.response?.status === 401) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in again to access your products.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error?.response?.status === 403) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">Your seller account is pending approval. Please contact support.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <Link 
            to="/seller/products/add" 
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">No products yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map(p => (
              <div key={p._id} className="card-hover">
                <img src={p.primaryImage || p.images?.[0]?.url} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{p.shortDescription}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-primary-600 font-semibold">₹{p.price?.amount} <span className="text-xs text-gray-500">{p.price?.unit?.replace('_',' ')}</span></span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.isApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/seller/products/${p._id}/edit`)} className="btn-outline text-sm px-4 py-2">Edit</button>
                    <button onClick={() => del(p._id)} className="btn-primary text-sm px-4 py-2">Delete</button>
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

export default MyProducts;
