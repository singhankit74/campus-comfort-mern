const express = require('express');
const router = express.Router();
const { 
  getAllStudents, 
  getStudentById,
  assignRegistrationNumber
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// Admin routes to manage students
router.get('/students', protect, authorize('admin'), getAllStudents);
router.get('/students/:id', protect, authorize('admin'), getStudentById);
router.put('/students/:id/assign-reg-number', protect, authorize('admin'), assignRegistrationNumber);

module.exports = router; 