const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentType: {
    type: String,
    required: true,
    enum: ['School', 'College']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  state: {
    type: String,
    required: true
  },
  roomPreferences: {
    preferredFloor: {
      type: Number,
      default: 1
    },
    preferredRoommates: [{
      type: String // Student IDs of preferred roommates
    }],
    acPreference: {
      type: Boolean,
      default: false // For college students
    },
    sameStatePreference: {
      type: Boolean,
      default: false
    }
  },
  hostelName: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Triple']
  },
  mealPlan: {
    type: String,
    required: true,
    enum: ['Vegetarian', 'Non-Vegetarian', 'No Meal Plan']
  },
  specialRequirements: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Room Allocated'],
    default: 'Pending'
  },
  allocatedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema); 