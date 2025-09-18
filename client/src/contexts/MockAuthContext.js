import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const MockAuthContext = createContext();

// Mock users for testing
const mockUsers = [
  {
    id: '1',
    name: 'Demo Tourist',
    email: 'tourist@demo.com',
    password: 'password123',
    role: 'tourist',
    isVerified: true,
    avatar: ''
  },
  {
    id: '2',
    name: 'Demo Seller',
    email: 'seller@demo.com',
    password: 'password123',
    role: 'seller',
    isVerified: true,
    avatar: ''
  },
  {
    id: '3',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    isVerified: true,
    avatar: ''
  }
];

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

export const MockAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('mock_token');
    const userId = localStorage.getItem('mock_user_id');
    
    if (token && userId) {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        return;
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid credentials' });
        toast.error('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }

      // Create mock token
      const token = `mock_token_${user.id}_${Date.now()}`;
      
      localStorage.setItem('mock_token', token);
      localStorage.setItem('mock_user_id', user.id);
      
      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Login successful!');
      
      return { success: true, user };
    } catch (error) {
      const message = 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'tourist',
        isVerified: true,
        avatar: ''
      };

      const token = `mock_token_${newUser.id}_${Date.now()}`;
      
      localStorage.setItem('mock_token', token);
      localStorage.setItem('mock_user_id', newUser.id);
      
      dispatch({ type: 'SET_USER', payload: newUser });
      toast.success('Registration successful!');
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('mock_token');
    localStorage.removeItem('mock_user_id');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({ type: 'UPDATE_USER', payload: profileData });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success('Password reset email sent (demo mode)');
      return { success: true };
    } catch (error) {
      const message = 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success('Password reset successfully (demo mode)');
      return { success: true };
    } catch (error) {
      const message = 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'UPDATE_USER', payload: { isVerified: true } });
      toast.success('Email verified successfully (demo mode)');
      return { success: true };
    } catch (error) {
      const message = 'Email verification failed';
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
    api: null, // Mock API
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a MockAuthProvider');
  }
  return context;
};

export default MockAuthContext;
