const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    console.log('Get all students request from admin:', { id: req.user._id });

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('Retrieved students count:', students.length);
    
    // Log sample student data for debugging
    if (students.length > 0) {
      console.log('Sample student data:', {
        id: students[0]._id,
        name: students[0].name,
        email: students[0].email,
        studentId: students[0].studentId,
        regNo: students[0].regNo
      });
    }

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting students'
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/users/students/:id
// @access  Private (admin only)
exports.getStudentById = async (req, res) => {
  try {
    console.log('Get student by ID request:', { studentId: req.params.id, adminId: req.user._id });

    const student = await User.findById(req.params.id).select('-password');

    if (!student) {
      console.log('Get student failed: Student not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.role !== 'student') {
      console.log('Get student failed: User is not a student', { id: req.params.id, role: student.role });
      return res.status(400).json({
        success: false,
        message: 'User is not a student'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting student'
    });
  }
};

// @desc    Assign registration number to a student
// @route   PUT /api/users/students/:id/assign-reg-number
// @access  Private (admin only)
exports.assignRegistrationNumber = async (req, res) => {
  try {
    console.log('Assign registration number request from admin:', { 
      adminId: req.user._id,
      studentId: req.params.id 
    });

    const student = await User.findById(req.params.id);

    if (!student) {
      console.log('Assign registration number failed: Student not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.role !== 'student') {
      console.log('Assign registration number failed: User is not a student', { id: req.params.id, role: student.role });
      return res.status(400).json({
        success: false,
        message: 'User is not a student'
      });
    }

    // If student already has a registration number, don't overwrite it
    if (student.regNo) {
      console.log('Student already has a registration number', { id: req.params.id, regNo: student.regNo });
      return res.json({
        success: true,
        message: 'Student already has a registration number',
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          regNo: student.regNo,
          department: student.department
        }
      });
    }

    // Generate a new registration number
    const regNo = await User.generateRegistrationNumber.call(User);
    
    // Update the student with the new registration number
    student.regNo = regNo;
    await student.save();

    console.log('Registration number assigned successfully', { id: student._id, regNo });

    res.json({
      success: true,
      message: 'Registration number assigned successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        regNo: student.regNo,
        department: student.department
      }
    });
  } catch (error) {
    console.error('Assign registration number error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error assigning registration number'
    });
  }
}; 