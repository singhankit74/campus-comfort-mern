import axios from 'axios';

// Add a request interceptor to automatically add auth token
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userStr = localStorage.getItem('user');
    console.log('User data from localStorage:', userStr ? userStr.substring(0, 100) + '...' : 'null');
    
    const user = userStr ? JSON.parse(userStr) : null;
    
    // If token exists, add to headers
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      console.log('Token added to request:', config.url, 'Token:', user.token.substring(0, 10) + '...');
    } else {
      console.log('No auth token available for request:', config.url, 'User object:', user);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // You could dispatch logout action here if needed
    }
    
    return Promise.reject(error);
  }
);

export default axios; 