const mongoose = require('mongoose');

// Hard-code MongoDB URI for testing
const MONGO_URI = 'mongodb://localhost:27017/campus-comfort';
console.log('Connecting to MongoDB at:', MONGO_URI);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  createTestEnrollments();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

const createTestEnrollments = async () => {
  try {
    // Find a student user
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.error('No student user found. Please create a student account first.');
      process.exit(1);
    }
    
    console.log(`Found student: ${student.name} (${student._id})`);
    
    // First, clear existing test enrollments
    console.log('Removing existing enrollments...');
    await Enrollment.deleteMany({ hostelName: { $regex: /Test/ } });
    
    // Create a test enrollment
    const enrollment = new Enrollment({
      user: student._id,
      studentType: 'College',
      gender: 'Male',
      state: 'Test State',
      roomPreferences: {
        preferredFloor: 1,
        acPreference: true,
        sameStatePreference: false
      },
      hostelName: 'Test Hostel',
      roomType: 'Single',
      mealPlan: 'Vegetarian',
      status: 'Pending'
    });
    
    await enrollment.save();
    
    console.log('Test enrollment created successfully:');
    console.log(enrollment);
    
    // Create another test enrollment (Approved)
    const approvedEnrollment = new Enrollment({
      user: student._id,
      studentType: 'College',
      gender: 'Male',
      state: 'Test State',
      roomPreferences: {
        preferredFloor: 2,
        acPreference: false,
        sameStatePreference: true
      },
      hostelName: 'Test Hostel 2',
      roomType: 'Double',
      mealPlan: 'Non-Vegetarian',
      status: 'Approved'
    });
    
    await approvedEnrollment.save();
    
    console.log('Approved test enrollment created successfully:');
    console.log(approvedEnrollment);
    
    // Create another test enrollment with Room Allocated status
    const allocatedEnrollment = new Enrollment({
      user: student._id,
      studentType: 'School',
      gender: 'Male',
      state: 'Test State',
      roomPreferences: {
        preferredFloor: 3,
        acPreference: true,
        sameStatePreference: false
      },
      hostelName: 'Test Hostel 3',
      roomType: 'Triple',
      mealPlan: 'Vegetarian',
      status: 'Room Allocated'
    });
    
    await allocatedEnrollment.save();
    
    console.log('Room Allocated test enrollment created successfully:');
    console.log(allocatedEnrollment);
    
    console.log('Test enrollments created successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test enrollment:', error);
    process.exit(1);
  }
}; 