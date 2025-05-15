const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get all chat rooms for the current user
router.get('/rooms', protect, chatController.getUserChatRooms);

// Get or create direct chat with another user
router.get('/direct/:participantId', protect, chatController.getOrCreateDirectChat);

// Create a new group chat
router.post('/group', protect, chatController.createGroupChat);

// Get messages for a specific chat room
router.get('/:chatId/messages', protect, chatController.getChatMessages);

// Get users for chat selection
router.get('/users', protect, chatController.getChatUsers);

module.exports = router; 