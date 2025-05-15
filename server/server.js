const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Set JWT_SECRET explicitly if it's not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'campus_comfort_secret_key';
  console.log('JWT_SECRET set explicitly');
} else {
  console.log('JWT_SECRET already exists in env');
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup with improved configuration
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5001', '*'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  maxHttpBufferSize: 1e8,
  path: '/socket.io',
  serveClient: false
});

// Middleware
// Configure CORS to accept requests from your frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', '*'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Define routes
const authRoutes = require('./routes/auth');
const issuesRoutes = require('./routes/issues');
const feedbackRoutes = require('./routes/feedback');
const enrollmentRoutes = require('./routes/enrollments');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const noticeRoutes = require('./routes/noticeRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://chocolatyankit1418:jAGgEaycEN8xz9e3@cluster0.kq4ag4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Error handling for MongoDB connection issues
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Debug route for testing
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Socket.io setup
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');
const User = require('./models/User');

// Map to store connected users
const connectedUsers = new Map();

// Important error logging for Socket.io
io.engine.on('connection_error', (err) => {
  console.error('Socket.io connection error:', err.message);
});

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return next(new Error(`JWT verification failed: ${jwtError.message}`));
    }
    
    if (!decoded || !decoded.id) {
      return next(new Error('Invalid token structure'));
    }
    
    socket.userId = decoded.id;
    
    // Get user details
    const user = await User.findById(decoded.id).select('name email role');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    socket.user = user;
    
    // Update user's online status
    await User.findByIdAndUpdate(decoded.id, { lastActive: new Date() });
    
    return next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    return next(new Error(`Authentication error: ${error.message}`));
  }
});

io.on('connection', (socket) => {
  // Add user to connected users map
  connectedUsers.set(socket.userId, socket.id);
  
  // Join user to their chat rooms
  socket.on('join_chat_rooms', async () => {
    try {
      const chatRooms = await ChatRoom.find({
        participants: socket.userId,
        isActive: true
      }).select('_id');
      
      chatRooms.forEach(room => {
        socket.join(room._id.toString());
      });
    } catch (error) {
      console.error('Error joining chat rooms:', error);
    }
  });
  
  // Handle sending messages
  socket.on('send_message', async (messageData) => {
    try {
      const { chatRoomId, content } = messageData;
      
      // Create new message in database
      const newMessage = await Message.create({
        chatRoom: chatRoomId,
        sender: socket.userId,
        content,
        readBy: [{ user: socket.userId }]
      });
      
      // Update chat room's last message timestamp
      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        lastMessage: new Date()
      });
      
      // Populate sender information
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email profileImage role regNo');
      
      // Emit message to all participants in the chat room
      io.to(chatRoomId).emit('new_message', populatedMessage);
      
      // Get all participants to notify about the new message
      const chatRoom = await ChatRoom.findById(chatRoomId);
      chatRoom.participants.forEach(participantId => {
        const participantIdStr = participantId.toString();
        
        // Don't notify the sender
        if (participantIdStr !== socket.userId) {
          const socketId = connectedUsers.get(participantIdStr);
          
          // If participant is connected, emit notification
          if (socketId) {
            io.to(socketId).emit('message_notification', {
              chatRoomId,
              message: populatedMessage
            });
          }
        }
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle read receipts
  socket.on('mark_as_read', async ({ chatRoomId }) => {
    try {
      // Update messages that haven't been read by this user
      await Message.updateMany(
        {
          chatRoom: chatRoomId,
          sender: { $ne: socket.userId },
          'readBy.user': { $ne: socket.userId }
        },
        {
          $push: { readBy: { user: socket.userId, readAt: new Date() } }
        }
      );
      
      // Notify other users that this user has read their messages
      io.to(chatRoomId).emit('messages_read', {
        chatRoomId,
        userId: socket.userId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
  
  // Handle typing indicators
  socket.on('typing', ({ chatRoomId }) => {
    socket.to(chatRoomId).emit('user_typing', {
      chatRoomId,
      userId: socket.userId,
      userName: socket.user.name
    });
  });
  
  socket.on('stop_typing', ({ chatRoomId }) => {
    socket.to(chatRoomId).emit('user_stop_typing', {
      chatRoomId,
      userId: socket.userId
    });
  });
  
  // Handle user disconnect
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.userId);
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Global error handler - Must be placed after all routes
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Define PORT - explicitly set to 5001 for consistency with client proxy
const PORT = process.env.PORT || 5001;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 