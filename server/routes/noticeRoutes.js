const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

// Create a new notice (admin only)
router.post('/', protect, authorize('admin'), noticeController.createNotice);

// Get all active notices
router.get('/', protect, noticeController.getNotices);

// Update a notice (admin only)
router.put('/:id', protect, authorize('admin'), noticeController.updateNotice);

// Delete a notice (admin only)
router.delete('/:id', protect, authorize('admin'), noticeController.deleteNotice);

module.exports = router; 