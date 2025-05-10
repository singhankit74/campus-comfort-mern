const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notices', noticeRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 