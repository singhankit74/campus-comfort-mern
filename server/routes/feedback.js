const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getMyFeedback
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/auth');

// Route for "My Feedback"
router.get('/me', protect, getMyFeedback);

// Main routes
router.route('/')
  .get(protect, authorize('admin', 'staff'), getAllFeedback)
  .post(protect, createFeedback);

router.route('/:id')
  .get(protect, getFeedback)
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

module.exports = router; 