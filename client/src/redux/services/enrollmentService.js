import axios from 'axios';

const API_URL = '/api/enrollments';

// Create a new enrollment
const createEnrollment = async (enrollmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(API_URL, enrollmentData, config);
  return response.data;
};

// Get all enrollments (admin only) with pagination and filtering
const getAllEnrollments = async (params, token) => {
  console.log('Calling API to get all enrollments with params:', params);
  
  // Only include non-empty parameters
  const queryParams = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status.trim() !== '') queryParams.status = params.status;
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: queryParams
  };
  
  try {
    const response = await axios.get(API_URL, config);
    console.log('API response for all enrollments:', response.data);
    
    // Validate the response structure
    if (!response.data || !response.data.enrollments) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response: missing enrollments data');
    }
    
    // Log the first enrollment if available for debugging
    if (response.data.enrollments && response.data.enrollments.length > 0) {
      console.log('First enrollment from API:', {
        id: response.data.enrollments[0]._id,
        user: response.data.enrollments[0].user,
        status: response.data.enrollments[0].status
      });
    } else {
      console.log('No enrollments returned from API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all enrollments:', error.response || error);
    // Provide a more detailed error object
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch enrollments',
      status: error.response?.status || 500,
      originalError: error.toString()
    };
  }
};

// Get my enrollments (student)
const getMyEnrollments = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/me`, config);
  return response.data;
};

// Get enrollment by ID
const getEnrollmentById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

// Update enrollment status (admin only)
const updateEnrollmentStatus = async (id, statusData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/${id}`, statusData, config);
  return response.data;
};

// Delete enrollment (admin only)
const deleteEnrollment = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const enrollmentService = {
  createEnrollment,
  getAllEnrollments,
  getMyEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  deleteEnrollment
};

export default enrollmentService; 