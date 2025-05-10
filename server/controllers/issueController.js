const Issue = require('../models/Issue');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    // Add user to req.body
    req.body.submittedBy = req.user._id;

    const issue = await Issue.create(req.body);

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res) => {
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
    query = Issue.find(JSON.parse(queryStr))
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');

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
    const total = await Issue.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const issues = await query;

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
      count: issues.length,
      pagination,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue not found with id of ${req.params.id}`
      });
    }

    // Make sure user is issue owner or staff/admin
    if (issue.submittedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to update this issue`
      });
    }

    issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue not found with id of ${req.params.id}`
      });
    }

    // Make sure user is issue owner or admin
    if (issue.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to delete this issue`
      });
    }

    await issue.remove();

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

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue not found with id of ${req.params.id}`
      });
    }

    const comment = {
      text: req.body.text,
      user: req.user._id
    };

    issue.comments.unshift(comment);

    await issue.save();

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my issues
// @route   GET /api/issues/me
// @access  Private
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ submittedBy: req.user._id })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 