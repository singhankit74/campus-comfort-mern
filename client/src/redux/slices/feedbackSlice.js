import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feedbacks: [],
  feedback: null,
  myFeedbacks: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: null
};

const feedbackSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setLoading: (state) => {
      state.isLoading = true;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    },
    getAllFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.feedbacks = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    getFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.feedback = action.payload;
    },
    getMyFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.myFeedbacks = action.payload;
    },
    createFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.feedbacks.unshift(action.payload);
      state.myFeedbacks.unshift(action.payload);
    },
    updateFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.feedback = action.payload;
      state.feedbacks = state.feedbacks.map(feedback => 
        feedback._id === action.payload._id ? action.payload : feedback
      );
      state.myFeedbacks = state.myFeedbacks.map(feedback => 
        feedback._id === action.payload._id ? action.payload : feedback
      );
    },
    deleteFeedbackSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.feedbacks = state.feedbacks.filter(feedback => feedback._id !== action.payload);
      state.myFeedbacks = state.myFeedbacks.filter(feedback => feedback._id !== action.payload);
    }
  }
});

export const {
  reset,
  setLoading,
  setError,
  getAllFeedbackSuccess,
  getFeedbackSuccess,
  getMyFeedbackSuccess,
  createFeedbackSuccess,
  updateFeedbackSuccess,
  deleteFeedbackSuccess
} = feedbackSlice.actions;

export default feedbackSlice.reducer; 