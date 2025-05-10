const Feedback = require('../models/Feedback');

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
  try {
    // Add user to req.body
    req.body.submittedBy = req.user._id;

    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private (Admin or Staff only)
exports.getAllFeedback = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Remove fields from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Feedback.find(JSON.parse(queryStr));
    
    // Handle anonymous feedback
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      // Admin and staff can see all feedback with submitter info
      query = query.populate({
        path: 'submittedBy',
        select: 'name email'
      });
    } else {
      // For other users, don't show submitter info for anonymous feedback
      query = query.populate({
        path: 'submittedBy',
        select: 'name email',
        match: { anonymous: false }
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Feedback.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const feedbacks = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      pagination,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private (Admin/Staff or owner)
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate({
      path: 'submittedBy',
      select: 'name email'
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`
      });
    }

    // Make sure user is feedback owner or admin/staff
    if (
      feedback.submittedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'staff'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to access this feedback`
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Admin/Staff only for status and response, Owner for other fields)
exports.updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`
      });
    }

    // Check if it's the owner
    const isOwner = feedback.submittedBy.toString() === req.user._id.toString();
    
    // Check if staff/admin is updating status/response
    const isAdminOrStaff = req.user.role === 'admin' || req.user.role === 'staff';
    const isStatusOrResponseUpdate = req.body.status || req.body.response;

    // Make sure user is authorized to update
    if (!isOwner && !(isAdminOrStaff && isStatusOrResponseUpdate)) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to update this feedback`
      });
    }

    // If owner is updating, only allow certain fields
    if (isOwner && !isAdminOrStaff) {
      const allowedUpdates = ['title', 'description', 'category', 'rating', 'anonymous'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update));
      
      if (!isValidOperation) {
        return res.status(400).json({
          success: false,
          message: 'You are only allowed to update specific fields'
        });
      }
    }

    feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin or owner)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id of ${req.params.id}`
      });
    }

    // Make sure user is feedback owner or admin
    if (
      feedback.submittedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to delete this feedback`
      });
    }

    await feedback.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my feedback
// @route   GET /api/feedback/me
// @access  Private
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ submittedBy: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 