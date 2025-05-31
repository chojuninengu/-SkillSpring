const express = require('express');
const router = express.Router();
const { 
  updateUserRole, 
  getUsersByRole, 
  getCurrentUser 
} = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Protected routes - require authentication
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information'
    });
  }
});

// Update current user
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is taken
    if (email) {
      const emailExists = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Update user
    const result = await db.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, role',
      [name, email, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user information'
    });
  }
});

// Admin only routes
router.put('/:userId/role', authenticateToken, isAdmin, updateUserRole);
router.get('/role/:role', authenticateToken, isAdmin, getUsersByRole);

module.exports = router; 