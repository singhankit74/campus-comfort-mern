import axios from 'axios';

const API_URL = '/api/issues';

// Create new issue
const createIssue = async (issueData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(API_URL, issueData, config);
  return response.data;
};

// Get issues
const getIssues = async (token, page = 1, limit = 10) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, config);
  return response.data;
};

// Get single issue
const getIssue = async (issueId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/${issueId}`, config);
  return response.data;
};

// Update issue
const updateIssue = async (issueId, issueData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/${issueId}`, issueData, config);
  return response.data;
};

// Delete issue
const deleteIssue = async (issueId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/${issueId}`, config);
  return response.data;
};

// Add comment to issue
const addComment = async (issueId, commentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/${issueId}/comments`, commentData, config);
  return response.data;
};

// Get my issues
const getMyIssues = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/me`, config);
  return response.data;
};

const issueService = {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addComment,
  getMyIssues
};

export default issueService; 