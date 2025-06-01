const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/database');

/**
 * @route POST /api/payments/collect
 * @desc Initiate a mobile money payment collection and enroll in course
 * @access Private (requires authentication)
 */
router.post('/collect', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, courseId } = req.body;
    const userId = req.user.id;

    console.log('Payment request received:', { amount, phoneNumber, courseId, userId });

    // Verify course exists and get its details
    const courseResult = await db.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    console.log('Course query result:', courseResult.rows);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courseResult.rows[0];
    console.log('Found course:', course);

    // Verify amount matches course price
    if (amount !== course.price) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match course price'
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

    // Create payment record
    const paymentResult = await db.query(
      'INSERT INTO payments (user_id, course_id, amount) VALUES ($1, $2, $3) RETURNING *',
      [userId, courseId, course.price]
    );

    // Create enrollment
    const enrollmentResult = await db.query(
      'INSERT INTO enrollments (user_id, course_id, progress) VALUES ($1, $2, $3) RETURNING *',
      [userId, courseId, 0]
    );

    res.status(201).json({
      success: true,
      data: {
        payment: paymentResult.rows[0],
        enrollment: enrollmentResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Payment route error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Payment failed'
    });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await db.query(
      `SELECT 
        p.*,
        c.title as course_title,
        c.description as course_description,
        u.name as mentor_name
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       JOIN users u ON c.mentor_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: payments.rows
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

module.exports = router; 