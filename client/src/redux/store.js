import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issueReducer from './slices/issueSlice';
import feedbackReducer from './slices/feedbackSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import roomReducer from './slices/roomSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issueReducer,
    feedback: feedbackReducer,
    enrollments: enrollmentReducer,
    rooms: roomReducer,
    users: userReducer
  }
}); 