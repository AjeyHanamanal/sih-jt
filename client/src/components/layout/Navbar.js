import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  HeartIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'seller':
        return '/seller/dashboard';
      default:
        return '/tourist/dashboard';
    }
  };

  // Base navigation for all users
  const baseNavigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Destinations', href: '/destinations', icon: MapPinIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
  ];

  // Admin-specific navigation items
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  ];

  // Seller-specific navigation items
  const sellerNavigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: HomeIcon },
    { name: 'My Products', href: '/seller/products', icon: ShoppingBagIcon },
    { name: 'Bookings', href: '/seller/bookings', icon: StarIcon },
    { name: 'Earnings', href: '/seller/earnings', icon: CurrencyDollarIcon },
  ];

  // Tourist-specific navigation items
  const touristNavigation = [
    { name: 'Destinations', href: '/destinations', icon: MapIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'My Bookings', href: '/tourist/bookings', icon: CalendarDaysIcon },
    { name: 'Itinerary Planner', href: '/tourist/itinerary', icon: HeartIcon },
  ];

  // Determine which navigation to show based on user role
  const navigation = user?.role === 'admin' ? adminNavigation : 
                   user?.role === 'seller' ? sellerNavigation : 
                   user?.role === 'tourist' ? touristNavigation :
                   baseNavigation;

  const userNavigation = user ? [
    { name: 'Dashboard', href: getDashboardPath() },
    ...(user.role === 'tourist' ? [
      { name: 'My Bookings', href: '/tourist/bookings' },
      { name: 'Itinerary Planner', href: '/tourist/itinerary' },
    ] : []),
    ...(user.role === 'seller' ? [
      { name: 'My Products', href: '/seller/products' },
      { name: 'My Bookings', href: '/seller/bookings' },
      { name: 'Earnings', href: '/seller/earnings' },
    ] : []),
    ...(user.role === 'admin' ? [
      { name: 'User Management', href: '/admin/users' },
      { name: 'Product Management', href: '/admin/products' },
      { name: 'Analytics', href: '/admin/analytics' },
    ] : []),
  ] : [];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gradient-animated">
                Jharkhand Tourism
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-lg'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      user.role === 'admin' 
                        ? 'focus:ring-red-500 bg-red-50 border border-red-200 hover:bg-red-100' 
                        : user.role === 'seller'
                        ? 'focus:ring-green-500 bg-green-50 border border-green-200 hover:bg-green-100'
                        : user.role === 'tourist'
                        ? 'focus:ring-blue-500 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                        : 'focus:ring-primary-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : user.role === 'seller'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : user.role === 'tourist'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-primary-500 to-primary-600'
                    }`}>
                      {user.role === 'admin' ? (
                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                      ) : user.role === 'seller' ? (
                        <BuildingStorefrontIcon className="h-5 w-5 text-white" />
                      ) : user.role === 'tourist' ? (
                        <MapIcon className="h-5 w-5 text-white" />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`font-semibold text-sm ${
                        user.role === 'admin' ? 'text-red-800' : 
                        user.role === 'seller' ? 'text-green-800' : 
                        user.role === 'tourist' ? 'text-blue-800' :
                        'text-gray-800'
                      }`}>
                        {user.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            🔒 ADMIN
                          </span>
                        )}
                        {user.role === 'seller' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            🏪 SELLER
                          </span>
                        )}
                        {user.role === 'tourist' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            🧳 TOURIST
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border ${
                      user.role === 'admin' ? 'border-red-200' : 
                      user.role === 'seller' ? 'border-green-200' : 
                      user.role === 'tourist' ? 'border-blue-200' :
                      'border-gray-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${
                        user.role === 'admin' ? 'border-red-100 bg-gradient-to-r from-red-50 to-red-100' : 
                        user.role === 'seller' ? 'border-green-100 bg-gradient-to-r from-green-50 to-green-100' : 
                        user.role === 'tourist' ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100' :
                        'border-gray-100 bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                            user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                            user.role === 'seller' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                            user.role === 'tourist' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            'bg-gradient-to-br from-primary-500 to-primary-600'
                          }`}>
                            {user.role === 'admin' ? (
                              <ShieldCheckIcon className="h-4 w-4 text-white" />
                            ) : user.role === 'seller' ? (
                              <BuildingStorefrontIcon className="h-4 w-4 text-white" />
                            ) : user.role === 'tourist' ? (
                              <MapIcon className="h-4 w-4 text-white" />
                            ) : (
                              <span className="text-white text-xs font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${
                              user.role === 'admin' ? 'text-red-900' : 
                              user.role === 'seller' ? 'text-green-900' : 
                              user.role === 'tourist' ? 'text-blue-900' :
                              'text-gray-900'
                            }`}>
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">{user.email}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              user.role === 'admin' 
                                ? 'bg-red-200 text-red-800' 
                                : user.role === 'seller'
                                ? 'bg-green-200 text-green-800'
                                : user.role === 'tourist'
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-primary-200 text-primary-800'
                            }`}>
                              {user.role === 'admin' ? '🔒 ADMIN' : 
                               user.role === 'seller' ? '🏪 SELLER' : 
                               user.role === 'tourist' ? '🧳 TOURIST' :
                               user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {user ? (
              <>
                <div className={`border-t pt-4 mt-4 ${
                  user.role === 'admin' ? 'border-red-200' : 
                  user.role === 'seller' ? 'border-green-200' : 
                  user.role === 'tourist' ? 'border-blue-200' :
                  'border-gray-200'
                }`}>
                  <div className={`px-4 py-3 mx-2 ${
                    user.role === 'admin' ? 'bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200' : 
                    user.role === 'seller' ? 'bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200' : 
                    user.role === 'tourist' ? 'bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200' :
                    'bg-gray-50 rounded-xl'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                        user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                        user.role === 'seller' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                        user.role === 'tourist' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        'bg-gradient-to-br from-primary-500 to-primary-600'
                      }`}>
                        {user.role === 'admin' ? (
                          <ShieldCheckIcon className="h-4 w-4 text-white" />
                        ) : user.role === 'seller' ? (
                          <BuildingStorefrontIcon className="h-4 w-4 text-white" />
                        ) : user.role === 'tourist' ? (
                          <MapIcon className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-white text-xs font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          user.role === 'admin' ? 'text-red-900' : 
                          user.role === 'seller' ? 'text-green-900' : 
                          user.role === 'tourist' ? 'text-blue-900' :
                          'text-gray-900'
                        }`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{user.email}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin' 
                            ? 'bg-red-200 text-red-800' 
                            : user.role === 'seller'
                            ? 'bg-green-200 text-green-800'
                            : user.role === 'tourist'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-primary-200 text-primary-800'
                        }`}>
                          {user.role === 'admin' ? '🔒 ADMIN' : 
                           user.role === 'seller' ? '🏪 SELLER' : 
                           user.role === 'tourist' ? '🧳 TOURIST' :
                           user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-500 text-white hover:bg-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
