import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics = () => {
  const { api } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch comprehensive analytics
  const { data: analytics, isLoading, error } = useQuery(
    ['comprehensive-analytics', timeRange],
    async () => {
      const res = await api.get('/analytics/comprehensive');
      return res.data?.data;
    },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error loading analytics</p>
          <p className="text-sm">{error?.response?.data?.message || error?.message}</p>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const userGrowth = analytics?.userGrowth || [];
  const bookingTrends = analytics?.bookingTrends || [];
  const revenueByMonth = analytics?.revenueByMonth || [];
  const popularDestinations = analytics?.popularDestinations || [];
  const topProducts = analytics?.topProducts || [];
  const topSellers = analytics?.topSellers || [];
  const bookingStatusDistribution = analytics?.bookingStatusDistribution || [];
  const userRoleDistribution = analytics?.userRoleDistribution || [];
  const productCategoryDistribution = analytics?.productCategoryDistribution || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into user growth, booking trends, revenue metrics, and platform performance.</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-soft p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(overview.totalUsers || 0)}</p>
                <p className="text-xs text-green-600">+{formatNumber(overview.newUsers30d || 0)} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(overview.totalRevenue || 0)}</p>
                <p className="text-xs text-green-600">{formatCurrency(overview.monthlyRevenue || 0)} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(overview.totalBookings || 0)}</p>
                <p className="text-xs text-gray-500">{formatNumber(overview.completedBookings || 0)} completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🏪</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sellers</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(overview.approvedSellers || 0)}</p>
                <p className="text-xs text-yellow-600">{formatNumber(overview.pendingSellers || 0)} pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="space-y-3">
              {revenueByMonth.slice(0, 6).map((month, index) => (
                <div key={month._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month._id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</span>
                    <span className="text-xs text-gray-500">({month.bookings} bookings)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-3">
              {userGrowth.slice(-7).map((day, index) => (
                <div key={day._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day._id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">+{day.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((day.count / Math.max(...userGrowth.map(d => d.count))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularDestinations.slice(0, 10).map((destination) => (
                  <tr key={destination._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{destination.name}</div>
                      <div className="text-sm text-gray-500">{destination.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{destination.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{destination.bookingCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(destination.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{destination.rating?.average || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">⭐</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products and Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{product.bookingCount} bookings</div>
                    <div className="text-xs text-gray-500">{formatCurrency(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sellers</h3>
            <div className="space-y-4">
              {topSellers.slice(0, 5).map((seller, index) => (
                <div key={seller._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{seller.businessInfo?.businessName || seller.name}</div>
                      <div className="text-xs text-gray-500">{seller.productCount} products</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{seller.bookingCount} bookings</div>
                    <div className="text-xs text-gray-500">{formatCurrency(seller.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-3">
              {bookingStatusDistribution.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status._id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{status.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status._id === 'completed' ? 'bg-green-500' :
                          status._id === 'pending' ? 'bg-yellow-500' :
                          status._id === 'cancelled' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${(status.count / Math.max(...bookingStatusDistribution.map(s => s.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles</h3>
            <div className="space-y-3">
              {userRoleDistribution.map((role) => (
                <div key={role._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{role._id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{role.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          role._id === 'tourist' ? 'bg-blue-500' :
                          role._id === 'seller' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${(role.count / Math.max(...userRoleDistribution.map(r => r.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
            <div className="space-y-3">
              {productCategoryDistribution.slice(0, 5).map((category) => (
                <div key={category._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{category._id?.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${(category.count / Math.max(...productCategoryDistribution.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Performance Summary */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatNumber(overview.activeUsers || 0)}</div>
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="text-xs text-green-600">
                {getPercentageChange(overview.activeUsers || 0, (overview.totalUsers || 0) - (overview.activeUsers || 0))}% active rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(overview.approvedProducts || 0)}</div>
              <div className="text-sm text-gray-500">Approved Products</div>
              <div className="text-xs text-blue-600">
                {getPercentageChange(overview.approvedProducts || 0, overview.pendingProducts || 0)}% approval rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(overview.completedBookings || 0)}</div>
              <div className="text-sm text-gray-500">Completed Bookings</div>
              <div className="text-xs text-purple-600">
                {getPercentageChange(overview.completedBookings || 0, overview.cancelledBookings || 0)}% completion rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(overview.monthlyRevenue || 0)}</div>
              <div className="text-sm text-gray-500">Monthly Revenue</div>
              <div className="text-xs text-orange-600">
                {formatCurrency((overview.monthlyRevenue || 0) / 30)} avg daily
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
