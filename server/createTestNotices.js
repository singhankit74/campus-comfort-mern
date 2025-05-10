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

const createTestNotices = async () => {
  try {
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Create test notices
    const testNotices = [
      {
        title: 'Welcome to Campus Comfort',
        content: 'Welcome to our new campus accommodation management system. We hope you find your stay comfortable and enjoyable!',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'Maintenance Schedule: October 2023',
        content: 'There will be scheduled maintenance in all dormitories on Saturday, October 15th from 10:00 AM to 2:00 PM. Please plan accordingly.',
        createdBy: admin._id,
        isActive: true
      },
      {
        title: 'New Meal Options Available',
        content: 'We have added new vegetarian and vegan options to our meal plans. Please visit the cafeteria to check out the new menu!',
        createdBy: admin._id,
        isActive: true
      }
    ];

    // Delete existing notices
    await Notice.deleteMany({});
    
    // Insert new notices
    await Notice.insertMany(testNotices);
    
    console.log('Test notices created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test notices:', error);
    process.exit(1);
  }
};

createTestNotices(); 