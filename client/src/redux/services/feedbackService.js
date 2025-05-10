import axios from 'axios';

const API_URL = '/api/feedback';

// Create new feedback
const createFeedback = async (feedbackData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(API_URL, feedbackData, config);
  return response.data;
};

// Get all feedback (admin/staff only)
const getAllFeedback = async (token, page = 1, limit = 10) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, config);
  return response.data;
};

// Get single feedback
const getFeedback = async (feedbackId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/${feedbackId}`, config);
  return response.data;
};

// Update feedback
const updateFeedback = async (feedbackId, feedbackData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/${feedbackId}`, feedbackData, config);
  return response.data;
};

// Delete feedback
const deleteFeedback = async (feedbackId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/${feedbackId}`, config);
  return response.data;
};

// Get my feedback
const getMyFeedback = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/me`, config);
  return response.data;
};

const feedbackService = {
  createFeedback,
  getAllFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getMyFeedback
};

export default feedbackService; 