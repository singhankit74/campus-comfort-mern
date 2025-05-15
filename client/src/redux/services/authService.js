import axios from 'axios';

// Define API URL - use the proxy from package.json
const API_URL = '/api/auth';
// If direct connection is needed, use this instead: 
// const API_URL = 'http://localhost:5001/api/auth';

// Register user
const register = async (userData) => {
  try {
    console.log('AuthService: register called with:', userData);
    
    const response = await axios.post(`${API_URL}/register`, userData);
    console.log('AuthService: register response:', response.data);
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Register service error:', error);
    throw error;
  }
};

// Login user
const login = async (userData) => {
  try {
    console.log('AuthService: login called with:', userData);
    
    // Make sure we're sending the right data
    const loginData = {
      email: userData.email,
      password: userData.password,
      role: userData.role
    };
    
    console.log('AuthService: sending login request with:', loginData);
    
    // Use proxy URL
    const response = await axios.post(`${API_URL}/login`, loginData);
    console.log('AuthService: login response:', response.data);
    
    if (response.data.success) {
      // Save user to localStorage
      const userData = response.data.user;
      console.log('AuthService: saving user to localStorage:', userData);
      // Log token specifically
      console.log('AuthService: user token:', userData.token ? `${userData.token.substring(0, 15)}...` : 'no token');
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      console.error('AuthService: login failed:', response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login service error:', error.response?.data || error.message);
    // Return a formatted error object that can be handled in the action creator
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Server connection failed'
    };
  }
};

// Get user profile
const getProfile = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
  } catch (error) {
    console.error('Get profile service error:', error);
    throw error;
  }
};

// Update user profile
const updateProfile = async (userData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.put(`${API_URL}/profile`, userData, config);
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Update profile service error:', error);
    throw error;
  }
};

// Helper function to check if user is stored in localStorage
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const authService = {
  register,
  login,
  getProfile,
  updateProfile,
  getCurrentUser
};

export default authService; 