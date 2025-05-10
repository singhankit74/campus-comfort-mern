const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notice = require('./models/Notice');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://chocolatyankit1418:jAGgEaycEN8xz9e3@cluster0.kq4ag4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const createTestNotice = async () => {
  try {
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Create a simple test notice
    const testNotice = new Notice({
      title: 'Test Notice - Please Ignore',
      content: 'This is a test notice to verify that the notice system is working correctly.',
      createdBy: admin._id,
      isActive: true
    });

    await testNotice.save();
    
    console.log('Test notice created successfully!');
    console.log('Notice Details:', testNotice);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test notice:', error);
    process.exit(1);
  }
};

createTestNotice(); 