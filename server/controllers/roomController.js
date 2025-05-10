const Room = require('../models/Room');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (admin only)
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, block, type, hasAC, capacity, floor } = req.body;

    // Check if room already exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: 'Room with this number already exists'
      });
    }

    // For school students, AC is compulsory
    let acStatus = hasAC;
    if (type === 'School') {
      acStatus = true;
    }

    const room = await Room.create({
      roomNumber,
      block,
      type,
      hasAC: acStatus,
      capacity: capacity || 6,
      floor: floor || 1,
      occupancy: 0,
      occupants: []
    });

    res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating room'
    });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private (admin only)
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate({
      path: 'occupants',
      select: 'name email studentId'
    });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting rooms'
    });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private (admin only)
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: 'occupants',
      select: 'name email studentId department'
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting room'
    });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (admin only)
exports.updateRoom = async (req, res) => {
  try {
    const { hasAC, status } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // For school type, AC must be true
    if (room.type === 'School' && hasAC === false) {
      return res.status(400).json({
        success: false,
        message: 'AC is compulsory for school students'
      });
    }

    // Update fields
    if (hasAC !== undefined) room.hasAC = hasAC;
    if (status) room.status = status;

    await room.save();

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating room'
    });
  }
};

// @desc    Allocate room to a student (manual allocation)
// @route   POST /api/rooms/allocate/:enrollmentId
// @access  Private (admin only)
exports.allocateRoom = async (req, res) => {
  try {
    console.log('Room allocation request received:', req.body, req.params);
    const { roomId, override = false } = req.body;
    const enrollmentId = req.params.enrollmentId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId).populate('user');
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('Found enrollment:', enrollment._id, enrollment.user?.name);

    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    console.log('Found room:', room._id, room.roomNumber);

    // Check if room is full - this check cannot be overridden
    if (room.occupancy >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room is already fully occupied'
      });
    }

    console.log('Room validation - override:', override);

    // Only perform these checks if override is not set
    if (!override) {
      // Check if room type matches student type
      if (room.type !== enrollment.studentType) {
        return res.status(400).json({
          success: false,
          message: `This room is for ${room.type} students only`
        });
      }

      // Check if block matches gender
      const correctBlock = (enrollment.gender === 'Male' && room.block === 'Boys') || 
                          (enrollment.gender === 'Female' && room.block === 'Girls');
      if (!correctBlock) {
        return res.status(400).json({
          success: false,
          message: `This room is in the ${room.block} block which doesn't match student gender`
        });
      }

      // Check AC requirement for school students
      if (enrollment.studentType === 'School' && !room.hasAC) {
        return res.status(400).json({
          success: false,
          message: 'AC rooms are compulsory for school students'
        });
      }

      // NEW VALIDATION: Check if room has any occupants of different student type
      if (room.occupancy > 0) {
        // Get current occupants
        const currentOccupants = await User.find({ _id: { $in: room.occupants } });
        const currentOccupantsEnrollments = await Enrollment.find({ 
          user: { $in: room.occupants }, 
          status: { $in: ['Approved', 'Room Allocated'] } 
        });
        
        // Check if any current occupant has a different student type
        for (const occupantEnrollment of currentOccupantsEnrollments) {
          if (occupantEnrollment.studentType !== enrollment.studentType) {
            return res.status(400).json({
              success: false,
              message: `Cannot allocate ${enrollment.studentType} student to a room with ${occupantEnrollment.studentType} students. ${enrollment.studentType} students can only stay with other ${enrollment.studentType} students.`
            });
          }
          
          if (occupantEnrollment.gender !== enrollment.gender) {
            return res.status(400).json({
              success: false,
              message: `Cannot allocate student to a room with students of different gender. Students can only stay with others of the same gender.`
            });
          }
        }
      }
    }

    // Check if student is already allocated to a room
    if (enrollment.allocatedRoom) {
      // If already in the same room, no need to reallocate
      if (enrollment.allocatedRoom.toString() === roomId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Student is already allocated to this room'
        });
      }
      
      // Deallocate from the current room first
      const currentRoom = await Room.findById(enrollment.allocatedRoom);
      if (currentRoom) {
        currentRoom.occupants = currentRoom.occupants.filter(
          occupant => occupant.toString() !== enrollment.user._id.toString()
        );
        currentRoom.occupancy = currentRoom.occupants.length;
        await currentRoom.save();
        console.log('Deallocated from current room:', currentRoom.roomNumber);
      }
    }

    // Update room occupancy
    room.occupants.push(enrollment.user._id);
    room.occupancy = room.occupants.length;
    
    // Update room status based on occupancy
    if (room.occupancy === 0) {
      room.status = 'Available';
    } else if (room.occupancy < room.capacity) {
      room.status = 'Partially Occupied';
    } else {
      room.status = 'Fully Occupied';
    }
    
    await room.save();
    console.log('Updated room occupancy:', room.occupancy);

    // Update enrollment
    enrollment.allocatedRoom = room._id;
    enrollment.status = 'Room Allocated';
    await enrollment.save();
    console.log('Updated enrollment status to Room Allocated');

    res.json({
      success: true,
      message: 'Room allocated successfully',
      enrollment,
      room
    });
  } catch (error) {
    console.error('Allocate room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error allocating room'
    });
  }
};

// @desc    Auto allocate rooms based on preferences
// @route   POST /api/rooms/auto-allocate
// @access  Private (admin only)
exports.autoAllocateRooms = async (req, res) => {
  try {
    // Get all pending approved enrollments without room allocation
    const enrollments = await Enrollment.find({
      status: 'Approved',
      allocatedRoom: null
    }).populate('user');

    if (enrollments.length === 0) {
      return res.json({
        success: true,
        message: 'No pending enrollments to allocate'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each enrollment
    for (const enrollment of enrollments) {
      try {
        // Find suitable rooms based on criteria
        const query = {
          type: enrollment.studentType,
          block: enrollment.gender === 'Male' ? 'Boys' : 'Girls',
          occupancy: { $lt: 6 } // Not fully occupied
        };

        // AC requirement for school students
        if (enrollment.studentType === 'School') {
          query.hasAC = true;
        } else {
          // For college students, respect AC preference
          query.hasAC = enrollment.roomPreferences.acPreference;
        }

        // Try to match floor preference if specified
        if (enrollment.roomPreferences.preferredFloor > 0) {
          query.floor = enrollment.roomPreferences.preferredFloor;
        }

        // Find rooms matching criteria
        let rooms = await Room.find(query).sort({ occupancy: -1 }); // Prioritize filling rooms

        // If no rooms with exact criteria, relax constraints
        if (rooms.length === 0) {
          // Remove floor preference
          delete query.floor;
          
          // For college students, be flexible with AC if necessary
          if (enrollment.studentType === 'College') {
            delete query.hasAC;
          }
          
          rooms = await Room.find(query).sort({ occupancy: -1 });
        }

        if (rooms.length === 0) {
          throw new Error(`No suitable rooms found for ${enrollment.studentType} ${enrollment.gender === 'Male' ? 'boy' : 'girl'}`);
        }

        // Default to first available room
        let selectedRoom = rooms[0];
        
        // For rooms with occupants, ensure student type compatibility
        const roomsWithCompatibleStudents = [];
        
        for (const room of rooms) {
          if (room.occupancy === 0) {
            // Empty rooms are always compatible
            roomsWithCompatibleStudents.push(room);
          } else {
            // Check if current occupants are of the same student type
            const occupantEnrollments = await Enrollment.find({
              user: { $in: room.occupants },
              status: { $in: ['Approved', 'Room Allocated'] }
            });
            
            // Skip rooms with incompatible student types
            let isCompatible = true;
            for (const occupantEnrollment of occupantEnrollments) {
              if (occupantEnrollment.studentType !== enrollment.studentType || 
                  occupantEnrollment.gender !== enrollment.gender) {
                isCompatible = false;
                break;
              }
            }
            
            if (isCompatible) {
              roomsWithCompatibleStudents.push(room);
            }
          }
        }
        
        // If no compatible rooms, fail this allocation
        if (roomsWithCompatibleStudents.length === 0) {
          throw new Error(`No compatible rooms found for ${enrollment.studentType} ${enrollment.gender === 'Male' ? 'boy' : 'girl'}`);
        }
        
        // Use compatible rooms for further processing
        rooms = roomsWithCompatibleStudents;
        selectedRoom = rooms[0];

        // Check for preferred roommates
        if (enrollment.roomPreferences.preferredRoommates.length > 0) {
          const preferredStudentIds = enrollment.roomPreferences.preferredRoommates;
          
          // Find users with these student IDs
          const preferredUsers = await User.find({
            studentId: { $in: preferredStudentIds }
          });
          
          const preferredUserIds = preferredUsers.map(user => user._id);
          
          // Look for rooms with these roommates
          for (const room of rooms) {
            // Check if any preferred roommate is in this room
            const hasPreferredRoommate = room.occupants.some(occupant => 
              preferredUserIds.some(id => id.toString() === occupant.toString())
            );
            
            if (hasPreferredRoommate) {
              selectedRoom = room;
              break;
            }
          }
        }

        // Allocate the selected room
        selectedRoom.occupants.push(enrollment.user._id);
        selectedRoom.occupancy = selectedRoom.occupants.length;
        await selectedRoom.save();

        // Update enrollment
        enrollment.allocatedRoom = selectedRoom._id;
        enrollment.status = 'Room Allocated';
        await enrollment.save();

        results.success.push({
          enrollment: enrollment._id,
          room: selectedRoom._id
        });
      } catch (error) {
        console.error(`Error allocating room for enrollment ${enrollment._id}:`, error);
        results.failed.push({
          enrollment: enrollment._id,
          reason: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Allocated ${results.success.length} rooms, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Auto allocate rooms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error auto-allocating rooms'
    });
  }
};

// @desc    Deallocate a student from a room
// @route   DELETE /api/rooms/deallocate/:enrollmentId
// @access  Private (admin only)
exports.deallocateRoom = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    if (!enrollment.allocatedRoom) {
      return res.status(400).json({
        success: false,
        message: 'No room allocated to deallocate'
      });
    }
    
    const room = await Room.findById(enrollment.allocatedRoom);
    
    if (room) {
      // Remove user from room occupants
      room.occupants = room.occupants.filter(
        occupant => occupant.toString() !== enrollment.user.toString()
      );
      room.occupancy = room.occupants.length;
      await room.save();
    }
    
    // Update enrollment
    enrollment.allocatedRoom = null;
    enrollment.status = 'Approved'; // Reset to approved status
    await enrollment.save();
    
    res.json({
      success: true,
      message: 'Room deallocated successfully'
    });
  } catch (error) {
    console.error('Deallocate room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deallocating room'
    });
  }
}; 