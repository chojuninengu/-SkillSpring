const express = require('express');
const router = express.Router();
const { auth, isMentor } = require('../middleware/auth');
const db = require('../config/database');

// Get current user profile
router.get('/me', auth, async (req, res) => {
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

// Update current user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is taken
    if (email) {
      const emailExists = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
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

// Get all students (mentor only)
router.get('/students', auth, isMentor, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email FROM users WHERE role = $1',
      ['student']
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

module.exports = router; 