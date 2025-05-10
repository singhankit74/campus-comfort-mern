const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile
router.get('/profile', protect, getProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

module.exports = router; 