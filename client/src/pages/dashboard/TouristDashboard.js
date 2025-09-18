import React from 'react';

const TouristDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tourist Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Bookings</h2>
            <p className="text-gray-600">View and manage your bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Itinerary Planner</h2>
            <p className="text-gray-600">Plan your perfect trip with AI assistance</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist</h2>
            <p className="text-gray-600">Save your favorite destinations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;
