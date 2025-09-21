import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
};

// Axios configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Handle demo tokens
      if (token.startsWith('demo_token_')) {
        const demoUsers = {
          'demo-tourist': { id: 'demo-tourist', name: 'Tourist Demo', role: 'tourist', email: 'tourist@demo.com', isVerified: true },
          'demo-seller': { id: 'demo-seller', name: 'Seller Demo', role: 'seller', email: 'seller@demo.com', isVerified: true },
          'demo-admin': { id: 'demo-admin', name: 'Admin Demo', role: 'admin', email: 'admin@demo.com', isVerified: true }
        };
        
        const userId = token.split('_')[2];
        const user = demoUsers[userId];
        
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
          return;
        }
      }

      const response = await api.get('/auth/me');
      dispatch({ type: 'SET_USER', payload: response.data.data.user });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        
        toast.success('Login successful!');
        return { success: true, user };
      } else {
        const message = response.data.message || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo mode for demo accounts
      if (email.includes('@demo.com') && password === 'password123') {
        const demoUsers = {
          'tourist@demo.com': { id: 'demo-tourist', name: 'Tourist Demo', role: 'tourist', email: 'tourist@demo.com', isVerified: true },
          'seller@demo.com': { id: 'demo-seller', name: 'Seller Demo', role: 'seller', email: 'seller@demo.com', isVerified: true },
          'admin@demo.com': { id: 'demo-admin', name: 'Admin Demo', role: 'admin', email: 'admin@demo.com', isVerified: true }
        };
        
        const demoUser = demoUsers[email];
        if (demoUser) {
          const token = `demo_token_${demoUser.id}_${Date.now()}`;
          localStorage.setItem('token', token);
          dispatch({ type: 'SET_USER', payload: demoUser });
          toast.success('Demo login successful!');
          return { success: true, user: demoUser };
        }
      }
      
      let message = 'Login failed';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 403) {
        message = 'Account is deactivated';
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message = 'Network error. Please check your connection.';
      }
      
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.status === 'success') {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        
        toast.success('Registration successful! Welcome to our platform.');
        return { success: true, user };
      } else {
        const message = response.data.message || 'Registration failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Fallback to demo mode for offline registration
      if (!navigator.onLine || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        const newUser = {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'tourist',
          isVerified: true,
          phone: userData.phone
        };
        
        const token = `demo_token_${newUser.id}_${Date.now()}`;
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: newUser });
        toast.success('Registration successful! (Demo mode)');
        return { success: true, user: newUser };
      }
      
      let message = 'Registration failed';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 400) {
        message = 'Please check your information and try again';
      } else if (error.response?.status === 409) {
        message = 'An account with this email already exists';
      } else if (error.response?.status >= 500) {
        message = 'Server error. Please try again later.';
      }
      
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await api.post('/auth/verify-email', { token });
      dispatch({ type: 'UPDATE_USER', payload: { isVerified: true } });
      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyEmail,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
