/**
 * This script will find all students with approved enrollments that don't have
 * a registration number and assign one to each of them.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://chocolatyankit1418:jAGgEaycEN8xz9e3@cluster0.kq4ag4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Import models
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');

async function fixRegistrationNumbers() {
  try {
    console.log('Starting to fix registration numbers...');
    
    // Find all approved or room allocated enrollments
    const approvedEnrollments = await Enrollment.find({
      status: { $in: ['Approved', 'Room Allocated'] }
    }).populate('user');
    
    console.log(`Found ${approvedEnrollments.length} approved enrollments`);
    
    // Count students without registration numbers
    const studentsWithoutRegNo = approvedEnrollments.filter(
      enrollment => !enrollment.user.regNo
    );
    
    console.log(`Found ${studentsWithoutRegNo.length} students without registration numbers`);
    
    // Assign registration numbers to students who don't have one
    let updatedCount = 0;
    
    for (const enrollment of studentsWithoutRegNo) {
      try {
        // Generate a registration number
        const regNo = await User.generateRegistrationNumber.call(User);
        
        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
          enrollment.user._id,
          { regNo },
          { new: true }
        );
        
        console.log(`Assigned registration number ${regNo} to student ${updatedUser.name} (${updatedUser._id})`);
        updatedCount++;
      } catch (error) {
        console.error(`Error assigning registration number to student ${enrollment.user._id}:`, error);
      }
    }
    
    console.log(`Successfully assigned registration numbers to ${updatedCount} students`);
    
    // Verify results
    const remainingStudentsWithoutRegNo = await User.countDocuments({
      _id: { $in: studentsWithoutRegNo.map(e => e.user._id) },
      regNo: { $exists: false }
    });
    
    console.log(`Remaining students without registration numbers: ${remainingStudentsWithoutRegNo}`);
    
    // Also let's check if the User.generateRegistrationNumber function is working
    try {
      const sampleRegNo = await User.generateRegistrationNumber.call(User);
      console.log(`Sample registration number generated: ${sampleRegNo}`);
    } catch (error) {
      console.error('Error generating sample registration number:', error);
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error in fixRegistrationNumbers:', error);
    process.exit(1);
  }
}

// Run the function
fixRegistrationNumbers(); 