import axios from 'axios';

const API_URL = '/api/users';

// Get all students (admin only)
const getAllStudents = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/students`, config);
  return response.data;
};

// Get student by ID (admin only)
const getStudentById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/students/${id}`, config);
  return response.data;
};

const userService = {
  getAllStudents,
  getStudentById
};

export default userService; 