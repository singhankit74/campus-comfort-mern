const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  addComment,
  getMyIssues
} = require('../controllers/issueController');

const { protect, authorize } = require('../middleware/auth');

// Route for "My Issues"
router.get('/me', protect, getMyIssues);

// Main routes
router.route('/')
  .get(protect, getIssues)
  .post(protect, createIssue);

router.route('/:id')
  .get(protect, getIssue)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue);

// Comment routes
router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router; 