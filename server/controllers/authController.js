const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  try {
    console.log('Generating token with secret: [secret-length]', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register attempt:', { email: req.body.email, role: req.body.role });
    
    const { name, email, password, role, department, adminCode } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Registration failed: User already exists', { email });
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate admin registration
    if (role === 'admin') {
      if (!adminCode || adminCode !== 'CAMPUS2025') {
        console.log('Admin registration failed: Invalid admin code');
        return res.status(400).json({
          success: false,
          message: 'Invalid admin code'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      department
    });

    if (user) {
      const token = generateToken(user._id);
      console.log('User registered successfully:', { id: user._id, email: user.email, role: user.role, regNo: user.regNo });
      
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          regNo: user.regNo,
          department: user.department,
          token
        }
      });
    } else {
      console.log('Registration failed: Invalid user data');
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, role: req.body.role });
    
    const { email, password, role } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Login failed: User not found', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Login failed: Password mismatch', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user role matches the requested role
    if (role && user.role !== role) {
      console.log('Login failed: Role mismatch', { email, userRole: user.role, requestedRole: role });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials for the selected role'
      });
    }

    const token = generateToken(user._id);
    console.log('User logged in successfully:', { id: user._id, email: user.email, role: user.role });
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        department: user.department,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    console.log('Get profile request for user:', { id: req.user._id });
    
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          regNo: user.regNo,
          department: user.department
        }
      });
    } else {
      console.log('Get profile failed: User not found', { id: req.user._id });
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error getting profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request for user:', { id: req.user._id });
    
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.department = req.body.department || user.department;
      
      // Only admin can change roles
      if (req.user.role === 'admin' && req.body.role) {
        user.role = req.body.role;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id);
      console.log('User profile updated successfully:', { id: updatedUser._id });

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          regNo: updatedUser.regNo,
          department: updatedUser.department,
          token
        }
      });
    } else {
      console.log('Update profile failed: User not found', { id: req.user._id });
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
}; 