const Notice = require('../models/Notice');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// Create a new notice
exports.createNotice = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create notices' });
        }

        const notice = new Notice({
            title,
            content,
            createdBy: req.user._id
        });

        await notice.save();
        res.status(201).json(notice);
    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({ message: 'Failed to create notice' });
    }
};

// Get all active notices for students
exports.getNotices = async (req, res) => {
    try {
        console.log(`Fetching notices for user: ${req.user._id}, role: ${req.user.role}`);
        
        // Check if user is admin - admins can see all notices
        if (req.user.role === 'admin') {
            console.log('User is admin, fetching all notices');
            const notices = await Notice.find()
                .sort({ createdAt: -1 })
                .populate('createdBy', 'name');
            return res.status(200).json(notices);
        }

        console.log('Fetching active notices for student');
        // Return active notices for students
        const notices = await Notice.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');

        res.status(200).json(notices);
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ message: 'Failed to fetch notices' });
    }
};

// Update a notice (admin only)
exports.updateNotice = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update notices' });
        }

        const { title, content, isActive } = req.body;
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        if (title) notice.title = title;
        if (content) notice.content = content;
        if (typeof isActive === 'boolean') notice.isActive = isActive;

        await notice.save();
        res.status(200).json(notice);
    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({ message: 'Failed to update notice' });
    }
};

// Delete a notice (admin only)
exports.deleteNotice = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete notices' });
        }

        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({ message: 'Failed to delete notice' });
    }
}; 