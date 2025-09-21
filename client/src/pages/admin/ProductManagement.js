import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductManagement = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Fetch product analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['product-analytics'],
    async () => {
      const res = await api.get('/products/admin/analytics');
      return res.data?.data;
    }
  );

  // Fetch products with filters
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['admin-products', filters, currentPage],
    async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });
      const res = await api.get(`/products/admin/all?${params}`);
      return res.data?.data;
    }
  );

  // Fetch pending products
  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    ['pending-products'],
    async () => {
      const res = await api.get('/products/admin/pending');
      return res.data?.data;
    }
  );

  // Approve/reject product mutation
  const approveProductMutation = useMutation(
    async ({ productId, approved, reason }) => {
      const res = await api.post(`/products/${productId}/approve`, { approved, reason });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-products']);
        queryClient.invalidateQueries(['pending-products']);
        queryClient.invalidateQueries(['product-analytics']);
        setShowApprovalModal(false);
        setSelectedProduct(null);
      }
    }
  );

  // Update product status mutation
  const updateStatusMutation = useMutation(
    async ({ productId, isActive }) => {
      const res = await api.put(`/products/${productId}/status`, { isActive });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-products']);
        queryClient.invalidateQueries(['product-analytics']);
      }
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    async (productId) => {
      const res = await api.delete(`/products/${productId}`);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-products']);
        queryClient.invalidateQueries(['pending-products']);
        queryClient.invalidateQueries(['product-analytics']);
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleApproveProduct = (product, approved) => {
    setSelectedProduct({ ...product, approved });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = (reason = '') => {
    if (selectedProduct) {
      approveProductMutation.mutate({
        productId: selectedProduct._id,
        approved: selectedProduct.approved,
        reason
      });
    }
  };

  const handleStatusToggle = (productId, currentStatus) => {
    updateStatusMutation.mutate({
      productId,
      isActive: !currentStatus
    });
  };

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  const stats = analytics?.overview || {};
  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {};
  const pendingProducts = pendingData?.products || [];

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Review, approve, and manage all products and services submitted by sellers.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts || 0}</p>
                <p className="text-xs text-green-600">+{stats.newProducts || 0} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedProducts || 0}</p>
                <p className="text-xs text-gray-500">Live on platform</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingProducts || 0}</p>
                <p className="text-xs text-yellow-600">Awaiting approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejectedProducts || 0}</p>
                <p className="text-xs text-red-600">Need attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Products Section */}
        {pendingProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approval ({pendingProducts.length})</h3>
              <span className="text-sm text-yellow-600">Requires immediate attention</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingProducts.slice(0, 3).map((product) => (
                <div key={product._id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">₹{product.price?.amount || product.price || 0}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveProduct(product, true)}
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveProduct(product, false)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="handicrafts">Handicrafts</option>
                <option value="homestay">Homestay</option>
                <option value="guide_service">Guide Service</option>
                <option value="transport">Transport</option>
                <option value="restaurant">Restaurant</option>
                <option value="tour_package">Tour Package</option>
                <option value="cultural_experience">Cultural Experience</option>
                <option value="adventure_activity">Adventure Activity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', category: '', search: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Products ({pagination.totalItems || 0})</h3>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">📦</span>
              <p className="text-lg">No products found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">📦</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.seller?.name || product.sellerId || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{product.seller?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {product.category?.replace('_', ' ') || 'Other'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{product.price?.amount || product.price || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.isApproved === true ? 'bg-green-100 text-green-800' :
                              product.isApproved === false ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {product.isApproved === true ? 'Approved' :
                               product.isApproved === false ? 'Rejected' :
                               'Pending'}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {product.isApproved === null && (
                            <>
                              <button
                                onClick={() => handleApproveProduct(product, true)}
                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveProduct(product, false)}
                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleStatusToggle(product._id, product.isActive)}
                            className={`px-3 py-1 rounded text-xs ${
                              product.isActive 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalItems)} of {pagination.totalItems} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedProduct.approved ? 'Approve Product' : 'Reject Product'}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Product:</strong> {selectedProduct.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Seller:</strong> {selectedProduct.seller?.name || selectedProduct.sellerId || 'Unknown'}
                  </p>
                </div>
                {!selectedProduct.approved && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      id="rejectionReason"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const reason = document.getElementById('rejectionReason')?.value || '';
                      handleApprovalSubmit(reason);
                    }}
                    className={`px-4 py-2 rounded-lg text-white ${
                      selectedProduct.approved 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {selectedProduct.approved ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
