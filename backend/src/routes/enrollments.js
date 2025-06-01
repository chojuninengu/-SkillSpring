const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/database');

// Get user's enrollments
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enrollments = await db.query(
      `SELECT 
        e.id, 
        e.progress, 
        e.created_at,
        c.id as course_id, 
        c.title, 
        c.description,
        c.price,
        u.name as mentor_name
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       JOIN users u ON c.mentor_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: enrollments.rows.map(row => ({
        id: row.id,
        progress: row.progress,
        created_at: row.created_at,
        course: {
          id: row.course_id,
          title: row.title,
          description: row.description,
          price: row.price,
          mentor_name: row.mentor_name
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

// Enroll in a course
router.post('/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const enrollmentCheck = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const result = await db.query(
      'INSERT INTO enrollments (user_id, course_id, progress) VALUES ($1, $2, $3) RETURNING *',
      [userId, courseId, 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
});

// Update enrollment progress
router.put('/:enrollmentId/progress', auth, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number between 0 and 100'
      });
    }

    // Update progress
    const result = await db.query(
      `UPDATE enrollments 
       SET progress = $1 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [progress, enrollmentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

module.exports = router; 