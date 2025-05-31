const User = require('../models/User');

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const updatedUser = await User.updateRole(userId, role);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.message === 'Invalid role specified') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.findByRole(role, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await User.countByRole(role);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error.message === 'Invalid role specified') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

module.exports = {
  updateUserRole,
  getUsersByRole,
  getCurrentUser
}; 