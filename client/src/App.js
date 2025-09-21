import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import TouristDashboard from './pages/dashboard/TouristDashboard';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Tourist Pages
import MyBookings from './pages/tourist/MyBookings';
import BookingDetail from './pages/tourist/BookingDetail';
import ItineraryPlanner from './pages/tourist/ItineraryPlanner';
import Wishlist from './pages/tourist/Wishlist';

// Seller Pages
import MyProducts from './pages/seller/MyProducts';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import SellerBookings from './pages/seller/MyBookings';
import Earnings from './pages/seller/Earnings';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import BookingManagement from './pages/admin/BookingManagement';
import Analytics from './pages/admin/Analytics';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ChatWidget from './components/chat/ChatWidget';
import GeminiChatbot from './components/chat/GeminiChatbot';
import GeminiItineraryBot from './components/chat/GeminiItineraryBot';
import Checkout from './pages/Checkout';
import Ticket from './pages/Ticket';



function App() {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Tourist Routes */}
          <Route path="/tourist/*" element={
            <ProtectedRoute allowedRoles={['tourist']}>
              <Routes>
                <Route path="dashboard" element={<TouristDashboard />} />
                <Route path="bookings" element={<MyBookings />} />
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route path="itinerary" element={<ItineraryPlanner />} />
                <Route path="wishlist" element={<Wishlist />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Seller Routes */}
          <Route path="/seller/*" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <Routes>
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products" element={<MyProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/:id/edit" element={<EditProduct />} />
                <Route path="bookings" element={<SellerBookings />} />
                <Route path="earnings" element={<Earnings />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="analytics" element={<Analytics />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a href="/" className="btn-primary">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
      <ChatWidget />
      <GeminiChatbot botName="Baby AI" />
      <GeminiItineraryBot botName="Itinerary Planner" />
    </div>
    
  );
}

export default App;
