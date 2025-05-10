const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Submit a new enrollment
// @route   POST /api/enrollments
// @access  Private (student only)
exports.createEnrollment = async (req, res) => {
  try {
    console.log('Create enrollment request from user:', { id: req.user._id, role: req.user.role });

    const { 
      hostelName, 
      roomType, 
      mealPlan, 
      specialRequirements,
      studentType,
      gender,
      state,
      roomPreferences
    } = req.body;

    // Validate required fields
    if (!studentType || !gender || !state) {
      return res.status(400).json({
        success: false,
        message: 'Student type, gender, and state are required'
      });
    }

    // For school students, AC is compulsory
    let acPreference = roomPreferences?.acPreference || false;
    if (studentType === 'School') {
      acPreference = true;
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user._id,
      hostelName,
      roomType,
      mealPlan,
      specialRequirements: specialRequirements || '',
      studentType,
      gender,
      state,
      roomPreferences: {
        preferredFloor: roomPreferences?.preferredFloor || 1,
        preferredRoommates: roomPreferences?.preferredRoommates || [],
        acPreference,
        sameStatePreference: roomPreferences?.sameStatePreference || false
      }
    });

    console.log('Enrollment created successfully:', { id: enrollment._id });

    res.status(201).json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating enrollment'
    });
  }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private (admin only)
exports.getEnrollments = async (req, res) => {
  try {
    console.log('Get all enrollments request from admin:', { 
      id: req.user._id,
      query: req.query  // Log the query parameters
    });

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    if (req.query.status && req.query.status.trim() !== '') {
      filter.status = req.query.status;
      console.log('Filtering enrollments by status:', filter.status);
    }

    // Get total count for pagination
    const total = await Enrollment.countDocuments(filter);
    console.log('Total enrollments matching filter:', total);

    // Get enrollments with pagination
    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'user',
        select: 'name email studentId department regNo role'
      })
      .populate({
        path: 'allocatedRoom',
        select: 'roomNumber block type hasAC floor occupancy'
      })
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip(startIndex)
      .limit(limit);

    console.log('Retrieved enrollments count:', enrollments.length);
    
    // Log the first enrollment for debugging
    if (enrollments.length > 0) {
      console.log('Sample enrollment with user data:', 
        JSON.stringify({
          id: enrollments[0]._id,
          user: enrollments[0].user,
          status: enrollments[0].status
        }, null, 2)
      );
    }

    // Pagination result
    const pagination = {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };

    res.json({
      success: true,
      count: enrollments.length,
      pagination,
      enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting enrollments'
    });
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/me
// @access  Private (student)
exports.getMyEnrollments = async (req, res) => {
  try {
    console.log('Get my enrollments request from user:', { id: req.user._id });

    const enrollments = await Enrollment.find({ user: req.user._id });

    console.log('Retrieved user enrollments count:', enrollments.length);

    res.json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting enrollments'
    });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private (admin and enrollment owner)
exports.getEnrollmentById = async (req, res) => {
  try {
    console.log('Get enrollment by ID request:', { enrollmentId: req.params.id, userId: req.user._id });

    const enrollment = await Enrollment.findById(req.params.id).populate({
      path: 'user',
      select: 'name email studentId department regNo'
    });

    if (!enrollment) {
      console.log('Get enrollment failed: Enrollment not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user is admin or the enrollment owner
    if (req.user.role !== 'admin' && enrollment.user._id.toString() !== req.user._id.toString()) {
      console.log('Get enrollment unauthorized:', { 
        enrollmentId: req.params.id, 
        userId: req.user._id,
        enrollmentOwnerId: enrollment.user._id 
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error('Get enrollment by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting enrollment'
    });
  }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id
// @access  Private (admin only)
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    console.log('Update enrollment status request:', { 
      enrollmentId: req.params.id, 
      adminId: req.user._id,
      newStatus: req.body.status 
    });

    const { status } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find enrollment with populated user
    const enrollment = await Enrollment.findById(req.params.id).populate('user');

    if (!enrollment) {
      console.log('Update enrollment failed: Enrollment not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update enrollment status
    enrollment.status = status;
    await enrollment.save();

    // If enrollment is approved, assign a registration number if the student doesn't have one
    if (status === 'Approved') {
      try {
        // Reload the user to get the most up-to-date data
        const User = require('../models/User');
        const student = await User.findById(enrollment.user._id);
        
        if (!student.regNo) {
          console.log('Student does not have a registration number. Generating one...', {
            studentId: student._id,
            name: student.name
          });
          
          // Generate registration number
          let regNo;
          try {
            regNo = await User.generateRegistrationNumber.call(User);
            console.log('Registration number generated:', regNo);
          } catch (genError) {
            console.error('Error generating registration number, using default:', genError);
            // Generate a fallback registration number if the function fails
            const year = new Date().getFullYear().toString().substr(-2);
            regNo = `CC${year}0001`;
          }
          
          // Update user with registration number
          const updatedUser = await User.findByIdAndUpdate(
            student._id, 
            { regNo },
            { new: true }
          );
          
          console.log('Registration number assigned to student:', { 
            userId: updatedUser._id, 
            regNo: updatedUser.regNo,
            success: !!updatedUser.regNo
          });
        } else {
          console.log('Student already has a registration number:', student.regNo);
        }
      } catch (error) {
        console.error('Error handling registration number:', error);
      }
    }

    console.log('Enrollment updated successfully:', { 
      id: enrollment._id, 
      newStatus: status 
    });

    // Get updated enrollment with user details
    const updatedEnrollment = await Enrollment.findById(req.params.id).populate({
      path: 'user',
      select: 'name email department regNo role'
    });

    res.json({
      success: true,
      enrollment: updatedEnrollment
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating enrollment'
    });
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private (admin only)
exports.deleteEnrollment = async (req, res) => {
  try {
    console.log('Delete enrollment request:', { 
      enrollmentId: req.params.id, 
      adminId: req.user._id
    });

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      console.log('Delete enrollment failed: Enrollment not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await enrollment.remove();

    console.log('Enrollment deleted successfully:', { id: req.params.id });

    res.json({
      success: true,
      message: 'Enrollment removed'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting enrollment'
    });
  }
}; 