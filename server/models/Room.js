const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  block: {
    type: String,
    required: true,
    enum: ['Boys', 'Girls']
  },
  type: {
    type: String,
    required: true,
    enum: ['School', 'College']
  },
  hasAC: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    default: 6
  },
  occupancy: {
    type: Number,
    default: 0
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  floor: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Under Maintenance'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update room status based on occupancy
RoomSchema.pre('save', function(next) {
  if (this.occupancy === 0) {
    this.status = 'Available';
  } else if (this.occupancy < this.capacity) {
    this.status = 'Partially Occupied';
  } else if (this.occupancy >= this.capacity) {
    this.status = 'Fully Occupied';
  }
  next();
});

module.exports = mongoose.model('Room', RoomSchema); 