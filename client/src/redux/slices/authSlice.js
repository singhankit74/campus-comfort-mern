import { createSlice } from '@reduxjs/toolkit';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isSuccess = true;
      state.isLoading = false;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
    },
    setLoading: (state) => {
      state.isLoading = true;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    }
  }
});

export const { reset, setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer; 