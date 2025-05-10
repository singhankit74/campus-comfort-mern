import { 
  setLoading, setError, 
  getIssuesSuccess, getIssueSuccess, 
  getMyIssuesSuccess, createIssueSuccess, 
  updateIssueSuccess, deleteIssueSuccess, 
  addCommentSuccess 
} from '../slices/issueSlice';
import issueService from '../services/issueService';

// Create issue
export const createIssue = (issueData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.createIssue(issueData, user.token);
    dispatch(createIssueSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get all issues
export const getIssues = (page = 1, limit = 10) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.getIssues(user.token, page, limit);
    dispatch(getIssuesSuccess(data));
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get single issue
export const getIssue = (issueId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.getIssue(issueId, user.token);
    dispatch(getIssueSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Update issue
export const updateIssue = (issueId, issueData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.updateIssue(issueId, issueData, user.token);
    dispatch(updateIssueSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Delete issue
export const deleteIssue = (issueId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    await issueService.deleteIssue(issueId, user.token);
    dispatch(deleteIssueSuccess(issueId));
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Add comment to issue
export const addComment = (issueId, commentData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.addComment(issueId, commentData, user.token);
    dispatch(addCommentSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
};

// Get my issues
export const getMyIssues = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading());
    
    const { auth: { user } } = getState();
    
    if (!user || !user.token) {
      throw new Error('Not authorized, no token');
    }
    
    const data = await issueService.getMyIssues(user.token);
    dispatch(getMyIssuesSuccess(data.data));
    return data.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    dispatch(setError(message));
    throw new Error(message);
  }
}; 