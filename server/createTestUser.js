const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hard-code MongoDB URI for testing
const MONGO_URI = 'mongodb://localhost:27017/campus-comfort';
console.log('Connecting to MongoDB at:', MONGO_URI);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  createTestUsers();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const User = require('./models/User');

const createTestUsers = async () => {
  try {
    // Clear existing test users
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    
    // Create salt for password hashing
    const salt = await bcrypt.genSalt(10);
    
    // Create hashed password
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create a test student user
    const studentUser = new User({
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      regNo: 'S12345',
      phone: '1234567890',
      department: 'Computer Science'
    });
    
    await studentUser.save();
    console.log('Test student created successfully:');
    console.log(studentUser);
    
    // Create a test admin user
    const adminUser = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Test admin created successfully:');
    console.log(adminUser);
    
    console.log('Test users created successfully. You can log in with:');
    console.log('Student: student@test.com / password123');
    console.log('Admin: admin@test.com / password123');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}; 