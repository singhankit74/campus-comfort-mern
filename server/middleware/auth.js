const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth token received:', token ? `${token.substring(0, 10)}...` : 'none');
    }

    // Check if token exists
    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      console.log('Verifying token with JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully for user ID:', decoded.id);

      // Find user by id
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Authentication failed: User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log('User authenticated:', { id: user._id, role: user.role });
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalid or expired'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.log('Authorization failed: No user in request');
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }
      
      if (!roles.includes(req.user.role)) {
        console.log('Authorization failed: Insufficient permissions', { 
          userRole: req.user.role, 
          requiredRoles: roles 
        });
        return res.status(403).json({
          success: false,
          message: `User role ${req.user.role} is not authorized to access this route`
        });
      }
      
      console.log('User authorized:', { id: req.user._id, role: req.user.role });
      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
}; 