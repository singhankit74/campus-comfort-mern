import axios from 'axios';

const API_URL = '/api/rooms';

// Create a new room
const createRoom = async (roomData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(API_URL, roomData, config);
  return response.data;
};

// Get all rooms
const getRooms = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get room by ID
const getRoomById = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/${roomId}`, config);
  return response.data;
};

// Update room
const updateRoom = async (roomId, roomData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/${roomId}`, roomData, config);
  return response.data;
};

// Allocate room to student
const allocateRoom = async (enrollmentId, roomData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/allocate/${enrollmentId}`, roomData, config);
  return response.data;
};

// Auto allocate rooms
const autoAllocateRooms = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/auto-allocate`, {}, config);
  return response.data;
};

// Deallocate room
const deallocateRoom = async (enrollmentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/deallocate/${enrollmentId}`, config);
  return response.data;
};

const roomService = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  allocateRoom,
  autoAllocateRooms,
  deallocateRoom
};

export default roomService; 