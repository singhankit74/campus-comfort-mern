const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  regNo: {
    type: String,
    unique: true,
    sparse: true  // Allows the field to be null/undefined
  },
  department: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique registration number for enrolled students will be handled in the enrollment process
// We're removing the auto-generation on user registration

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  try {
    // Only hash password if it's modified
    if (this.isModified('password')) {
      console.log('Hashing password for user:', this.email);
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    console.error('User pre-save error:', error);
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Password comparison failed');
  }
};

// Function to generate a registration number
// Make it a regular function first, then attach it to the model later
async function generateRegistrationNumber() {
  try {
    console.log('Generating registration number...');
    // Get the current year
    const year = new Date().getFullYear().toString().substr(-2);
    
    // Ensure 'this' refers to the User model
    const UserModel = this.model ? this : this.constructor ? this.constructor : require('./User');
    
    console.log('User model found:', !!UserModel);
    
    // Find the latest registration number with the current year prefix
    const latestUser = await UserModel.findOne(
      { regNo: { $regex: `^CC${year}` } },
      { regNo: 1 },
      { sort: { regNo: -1 } }
    );
    
    let nextNumber = 1;
    
    // If a registration number with current year exists, increment it
    if (latestUser && latestUser.regNo) {
      console.log('Latest registration number found:', latestUser.regNo);
      const currentNumber = parseInt(latestUser.regNo.substring(4));
      nextNumber = isNaN(currentNumber) ? 1 : currentNumber + 1;
    }
    
    // Format: CC[year][4-digit-sequential-number]
    const regNo = `CC${year}${nextNumber.toString().padStart(4, '0')}`;
    
    console.log('Generated registration number:', regNo);
    return regNo;
  } catch (error) {
    console.error('Error generating registration number:', error);
    // Default pattern if something goes wrong
    const defaultRegNo = `CC${new Date().getFullYear().toString().substr(-2)}0001`;
    console.log('Using default registration number pattern:', defaultRegNo);
    return defaultRegNo;
  }
}

// Create the User model
const User = mongoose.model('User', UserSchema);

// Add static method to the model after creation
User.generateRegistrationNumber = generateRegistrationNumber;

module.exports = User; 