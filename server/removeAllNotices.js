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

const removeAllNotices = async () => {
  try {
    // Delete all notices
    const result = await Notice.deleteMany({});
    
    console.log(`Successfully removed all notices. Deleted ${result.deletedCount} notice(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error removing notices:', error);
    process.exit(1);
  }
};

removeAllNotices(); 