const express = require('express');
const router = express.Router();
const { 
  updateUserRole, 
  getUsersByRole, 
  getCurrentUser 
} = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { pool } = require('../db/db');

// Protected routes - require authentication
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is taken
    if (email) {
      const emailExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Update user
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, role',
      [name, email, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only routes
router.put('/:userId/role', authenticateToken, isAdmin, updateUserRole);
router.get('/role/:role', authenticateToken, isAdmin, getUsersByRole);

module.exports = router; 