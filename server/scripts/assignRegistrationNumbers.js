/**
 * Admin script to assign registration numbers to approved students
 * 
 * Usage: 
 *   node scripts/assignRegistrationNumbers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://chocolatyankit1418:jAGgEaycEN8xz9e3@cluster0.kq4ag4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Import models
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

async function assignRegistrationNumbers() {
  try {
    console.log('Starting to assign registration numbers...');
    
    // Find all students with approved or room allocated enrollments
    const approvedEnrollments = await Enrollment.find({
      status: { $in: ['Approved', 'Room Allocated'] }
    }).populate('user');
    
    console.log(`Found ${approvedEnrollments.length} approved enrollments`);
    
    // Count students without registration numbers
    const studentsWithoutRegNo = approvedEnrollments.filter(
      enrollment => !enrollment.user.regNo
    );
    
    console.log(`Found ${studentsWithoutRegNo.length} students without registration numbers`);
    
    if (studentsWithoutRegNo.length === 0) {
      console.log('All approved students already have registration numbers.');
      return;
    }
    
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
    
  } catch (error) {
    console.error('Error in assignRegistrationNumbers:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
assignRegistrationNumbers().then(() => {
  console.log('Done!');
}); 