import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  issues: [],
  issue: null,
  myIssues: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: null
};

const issueSlice = createSlice({
  name: 'issues',
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
    getIssuesSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issues = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    getIssueSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issue = action.payload;
    },
    getMyIssuesSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.myIssues = action.payload;
    },
    createIssueSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issues.unshift(action.payload);
      state.myIssues.unshift(action.payload);
    },
    updateIssueSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issue = action.payload;
      state.issues = state.issues.map(issue => 
        issue._id === action.payload._id ? action.payload : issue
      );
      state.myIssues = state.myIssues.map(issue => 
        issue._id === action.payload._id ? action.payload : issue
      );
    },
    deleteIssueSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issues = state.issues.filter(issue => issue._id !== action.payload);
      state.myIssues = state.myIssues.filter(issue => issue._id !== action.payload);
    },
    addCommentSuccess: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.issue = action.payload;
    }
  }
});

export const {
  reset,
  setLoading,
  setError,
  getIssuesSuccess,
  getIssueSuccess,
  getMyIssuesSuccess,
  createIssueSuccess,
  updateIssueSuccess,
  deleteIssueSuccess,
  addCommentSuccess
} = issueSlice.actions;

export default issueSlice.reducer; 