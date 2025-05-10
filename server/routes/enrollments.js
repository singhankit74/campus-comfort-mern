const express = require('express');
const router = express.Router();
const { 
  createEnrollment, 
  getEnrollments, 
  getMyEnrollments, 
  getEnrollmentById, 
  updateEnrollmentStatus, 
  deleteEnrollment 
} = require('../controllers/enrollmentController');

const { protect, authorize } = require('../middleware/auth');

// Debug route - GET /api/enrollments/debug
router.get('/debug', async (req, res) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find().lean();
    
    console.log('Debug - Found enrollments:', enrollments.length);
    
    res.json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting debug enrollments'
    });
  }
});

// Debug route - GET /api/enrollments/debug-reg-numbers
router.get('/debug-reg-numbers', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ regNo: { $exists: true } }).select('name email regNo role').lean();
    
    console.log('Debug - Found users with regNo:', users.length);
    
    // Try to generate a sample registration number
    let sampleRegNo = null;
    try {
      sampleRegNo = await User.generateRegistrationNumber.call(User);
    } catch (error) {
      console.error('Error generating sample registration number:', error);
    }
    
    res.json({
      success: true,
      count: users.length,
      users,
      sampleRegNo
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in debug-reg-numbers route'
    });
  }
});

// Routes for students
router.post('/', protect, authorize('student'), createEnrollment);
router.get('/me', protect, authorize('student'), getMyEnrollments);

// Routes for admins
router.get('/', protect, authorize('admin'), getEnrollments);
router.put('/:id', protect, authorize('admin'), updateEnrollmentStatus);
router.delete('/:id', protect, authorize('admin'), deleteEnrollment);

// Routes for both students and admins
router.get('/:id', protect, getEnrollmentById);

module.exports = router; 