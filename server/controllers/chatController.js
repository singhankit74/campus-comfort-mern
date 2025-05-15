const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all chat rooms for a user
exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chatRooms = await ChatRoom.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email profileImage role regNo')
    .sort({ lastMessage: -1 });
    
    return res.status(200).json({
      success: true,
      data: chatRooms
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get or create a direct chat room between two users
exports.getOrCreateDirectChat = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user.id;
    
    // Validate participant ID
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant ID'
      });
    }
    
    // Check if participant exists
    const participant = await User.findById(participantId).select('name email role');
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      type: 'direct',
      participants: { $all: [userId, participantId] },
      isActive: true
    }).populate('participants', 'name email profileImage role regNo');
    
    // If chat room doesn't exist, create a new one
    if (!chatRoom) {
      const user = await User.findById(userId).select('name');
      
      // Create chat room name (combine names of participants)
      const roomName = `${user.name} and ${participant.name}`;
      
      chatRoom = await ChatRoom.create({
        name: roomName,
        type: 'direct',
        participants: [userId, participantId],
        createdBy: userId
      });
      
      // Populate participants after creation
      chatRoom = await ChatRoom.findById(chatRoom._id)
        .populate('participants', 'name email profileImage role regNo');
    }
    
    return res.status(200).json({
      success: true,
      data: chatRoom
    });
  } catch (error) {
    console.error('Error creating/fetching direct chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!name || !participants || !Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name and at least one other participant'
      });
    }
    
    // Ensure creator is included in participants
    const allParticipants = [...new Set([...participants, userId])];
    
    // Create the group chat
    const chatRoom = await ChatRoom.create({
      name,
      type: 'group',
      participants: allParticipants,
      createdBy: userId
    });
    
    // Populate and return the created chat room
    const populatedChatRoom = await ChatRoom.findById(chatRoom._id)
      .populate('participants', 'name email profileImage role regNo');
    
    return res.status(201).json({
      success: true,
      data: populatedChatRoom
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get messages for a chat room
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    
    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room ID'
      });
    }
    
    // Check if user is a participant in the chat room
    const chatRoom = await ChatRoom.findOne({
      _id: chatId,
      participants: userId,
      isActive: true
    });
    
    if (!chatRoom) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat room'
      });
    }
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages
    const messages = await Message.find({
      chatRoom: chatId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('sender', 'name email profileImage role regNo');
    
    // Update read status for unread messages
    await Message.updateMany(
      {
        chatRoom: chatId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );
    
    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get list of users for starting new chats
exports.getChatUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching chat users for user ID:', userId);
    
    const { search = '' } = req.query;
    console.log('Search query:', search);
    
    let query = { _id: { $ne: userId } };
    
    // Add search functionality if query provided
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { regNo: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    const users = await User.find(query)
      .select('name email profileImage role regNo')
      .limit(20);
    
    console.log(`Found ${users.length} users`);
    
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users for chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 