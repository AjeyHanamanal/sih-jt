import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  EyeIcon,
  StarIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Stat = ({ label, value, icon: Icon, trend, trendValue, color = "primary" }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      )}
    </div>
  </div>
);

const SellerDashboard = () => {
  const { api } = useAuth();

  const productsQ = useQuery(
    ['seller-dash-products'],
    async () => {
      const res = await api.get('/products/seller/my-products', { params: { limit: 6 } });
      return res.data?.data?.products || [];
    },
    { retry: false }
  );

  const bookingsQ = useQuery(
    ['seller-dash-bookings'],
    async () => {
      const res = await api.get('/bookings', { params: { limit: 6 } });
      return res.data?.data?.bookings || [];
    },
    { retry: false }
  );

  // Sample data for demonstration
  const sampleProducts = [
    {
      _id: '1',
      name: 'Traditional Jharkhand Handicrafts',
      category: 'handicrafts',
      price: { amount: 2500 },
      rating: 4.8,
      views: 1250,
      isApproved: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '2',
      name: 'Ranchi Heritage Tour Package',
      category: 'tour_package',
      price: { amount: 3500 },
      rating: 4.6,
      views: 890,
      isApproved: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '3',
      name: 'Tribal Homestay Experience',
      category: 'homestay',
      price: { amount: 1800 },
      rating: 4.9,
      views: 2100,
      isApproved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '4',
      name: 'Adventure Trekking Guide',
      category: 'guide_service',
      price: { amount: 1200 },
      rating: 4.7,
      views: 650,
      isApproved: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const sampleBookings = [
    {
      _id: '1',
      product: { name: 'Traditional Jharkhand Handicrafts' },
      customer: { name: 'Priya Sharma' },
      status: 'confirmed',
      pricing: { totalAmount: 2500 },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '2',
      product: { name: 'Ranchi Heritage Tour Package' },
      customer: { name: 'Rajesh Kumar' },
      status: 'completed',
      pricing: { totalAmount: 3500 },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '3',
      product: { name: 'Tribal Homestay Experience' },
      customer: { name: 'Anita Singh' },
      status: 'pending',
      pricing: { totalAmount: 1800 },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '4',
      product: { name: 'Adventure Trekking Guide' },
      customer: { name: 'Vikram Patel' },
      status: 'confirmed',
      pricing: { totalAmount: 1200 },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      bookingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const products = productsQ.data?.length > 0 ? productsQ.data : sampleProducts;
  const bookings = bookingsQ.data?.length > 0 ? bookingsQ.data : sampleBookings;
  
  // Calculate analytics
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
  
  const pendingRevenue = bookings
    .filter(b => b.status === 'pending')
    .reduce((s, b) => s + (b.pricing?.totalAmount || 0), 0);
  
  const averageRating = products.length > 0 
    ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
    : 0;
  
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const approvedProducts = products.filter(p => p.isApproved).length;
  const pendingProducts = products.filter(p => !p.isApproved).length;

  // Handle auth errors
  if (productsQ.error?.response?.status === 401 || bookingsQ.error?.response?.status === 401) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in again to access your dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (productsQ.error?.response?.status === 403 || bookingsQ.error?.response?.status === 403) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">Your seller account is pending approval. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Dashboard</h1>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Stat 
            label="Total Products" 
            value={products.length} 
            icon={ChartBarIcon}
            trend="up"
            trendValue="+2 this week"
            color="blue"
          />
          <Stat 
            label="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon={CurrencyRupeeIcon}
            trend="up"
            trendValue="+15% this month"
            color="green"
          />
          <Stat 
            label="Average Rating" 
            value={averageRating} 
            icon={StarIcon}
            trend="up"
            trendValue="+0.2 this month"
            color="yellow"
          />
          <Stat 
            label="Total Views" 
            value={totalViews.toLocaleString()} 
            icon={EyeIcon}
            trend="up"
            trendValue="+8% this week"
            color="purple"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Stat 
            label="Active Bookings" 
            value={bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length} 
            icon={CalendarIcon}
            color="indigo"
          />
          <Stat 
            label="Pending Revenue" 
            value={`₹${pendingRevenue.toLocaleString()}`} 
            icon={CurrencyRupeeIcon}
            color="orange"
          />
          <Stat 
            label="Approved Products" 
            value={`${approvedProducts}/${products.length}`} 
            icon={UserGroupIcon}
            color="teal"
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/seller/products" className="card p-6 hover:shadow-medium transition">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Products</h2>
            <p className="text-gray-600">Manage your products and services</p>
          </Link>
          <Link to="/seller/products/add" className="card p-6 hover:shadow-medium transition border-2 border-dashed border-primary-300 hover:border-primary-400">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Product</h2>
              <p className="text-gray-600">Create a new product or service listing</p>
            </div>
          </Link>
          <Link to="/seller/bookings" className="card p-6 hover:shadow-medium transition">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bookings</h2>
            <p className="text-gray-600">View and manage customer bookings</p>
          </Link>
          <Link to="/seller/earnings" className="card p-6 hover:shadow-medium transition">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Earnings</h2>
            <p className="text-gray-600">Track your earnings and analytics</p>
          </Link>
        </div>

        {/* Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Products</h3>
              <Link to="/seller/products" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            {products.length === 0 ? (
              <p className="text-gray-600 text-sm">No products yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {products.slice(0,5).map(p => (
                  <li key={p._id} className="py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        ₹{p.price?.amount?.toLocaleString()} • {p.category?.replace('_',' ')} • {p.views?.toLocaleString()} views
                      </div>
                      <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{typeof p.rating === 'object' ? p.rating?.average || 0 : p.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <Link to="/seller/bookings" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-600 text-sm">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {bookings.slice(0,5).map(b => (
                  <li key={b._id} className="py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{b.product?.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Customer: {b.customer?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Booked: {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                      </span>
                      <div className="text-sm font-semibold text-primary-600 mt-1">
                        ₹{b.pricing?.totalAmount?.toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Confirmed Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{averageRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Product Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
