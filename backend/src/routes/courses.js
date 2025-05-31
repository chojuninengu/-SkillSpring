const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/db');

/**
 * @route GET /api/courses
 * @desc Get all available courses
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.name as mentor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_students
      FROM courses c
      JOIN users u ON c.mentor_id = u.id
      ORDER BY c.created_at DESC
    `);

    // Format the price in FCFA
    const courses = result.rows.map(course => ({
      ...course,
      price_formatted: course.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' FCFA'
    }));

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

/**
 * @route GET /api/courses/:id
 * @desc Get course details by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        c.*,
        u.name as mentor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_students
      FROM courses c
      JOIN users u ON c.mentor_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = {
      ...result.rows[0],
      price_formatted: result.rows[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' FCFA'
    };

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course details'
    });
  }
});

/**
 * @route POST /api/courses
 * @desc Create a new course
 * @access Private (Mentor only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const mentorId = req.user.id;

    // Verify user is a mentor
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can create courses'
      });
    }

    const result = await pool.query(
      'INSERT INTO courses (title, description, mentor_id, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, mentorId, price, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

module.exports = router; 