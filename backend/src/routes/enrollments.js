const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Get user's enrollments
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enrollments = await db.query(
      `SELECT e.id, e.progress, c.id as course_id, c.title, c.description 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: enrollments.rows.map(row => ({
        id: row.id,
        progress: row.progress,
        courses: {
          id: row.course_id,
          title: row.title,
          description: row.description
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

module.exports = router; 