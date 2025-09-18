import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">Manage users and sellers</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Management</h2>
            <p className="text-gray-600">Approve and manage products</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
            <p className="text-gray-600">View platform analytics and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
