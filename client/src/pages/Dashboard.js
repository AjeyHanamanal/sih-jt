import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller/dashboard" replace />;
    default:
      return <Navigate to="/tourist/dashboard" replace />;
  }
};

export default Dashboard;
