import { 
  setLoading, setError, 
  getAllFeedbackSuccess, getFeedbackSuccess, 
  getMyFeedbackSuccess, createFeedbackSuccess, 
  updateFeedbackSuccess, deleteFeedbackSuccess
} from '../slices/feedbackSlice';
import feedbackService from '../services/feedbackService';

// Create feedback
export const createFeedback = (feedbackData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await feedbackService.createFeedback(feedbackData, user.token);
    dispatch(createFeedbackSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get all feedback (admin/staff only)
export const getAllFeedback = (page = 1, limit = 10) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await feedbackService.getAllFeedback(user.token, page, limit);
    dispatch(getAllFeedbackSuccess(data));
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get single feedback
export const getFeedback = (feedbackId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await feedbackService.getFeedback(feedbackId, user.token);
    dispatch(getFeedbackSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Update feedback
export const updateFeedback = (feedbackId, feedbackData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await feedbackService.updateFeedback(feedbackId, feedbackData, user.token);
    dispatch(updateFeedbackSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Delete feedback
export const deleteFeedback = (feedbackId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    await feedbackService.deleteFeedback(feedbackId, user.token);
    dispatch(deleteFeedbackSuccess(feedbackId));
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get my feedback
export const getMyFeedback = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await feedbackService.getMyFeedback(user.token);
    dispatch(getMyFeedbackSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
}; 