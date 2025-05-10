const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notice = require('./models/Notice');

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://chocolatyankit1418:jAGgEaycEN8xz9e3@cluster0.kq4ag4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const removeTestNotice = async () => {
  try {
    // Find and remove the test notice
    const result = await Notice.deleteOne({ 
      title: 'Test Notice - Please Ignore' 
    });
    
    if (result.deletedCount > 0) {
      console.log('Test notice removed successfully!');
    } else {
      console.log('Test notice not found or already removed.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error removing test notice:', error);
    process.exit(1);
  }
};

removeTestNotice(); 