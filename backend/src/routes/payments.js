const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../utils/payment');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../db/db');

/**
 * @route POST /api/payments/collect
 * @desc Initiate a mobile money payment collection and enroll in course
 * @access Private (requires authentication)
 */
router.post('/collect', authenticateToken, async (req, res) => {
  try {
    const { amount, phoneNumber, courseId } = req.body;
    const studentId = req.user.id;

    // Verify course exists and get its details
    const courseResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Verify amount matches course price
    if (amount !== course.price) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match course price'
      });
    }

    // Initiate payment
    const paymentResult = await initiatePayment(amount, phoneNumber);

    // If payment is successful, create enrollment
    if (paymentResult.success) {
      await pool.query(
        'INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, $3)',
        [studentId, courseId, 'active']
      );
    }

    // Return success response
    res.json({
      success: true,
      message: 'Payment successful and enrollment created',
      data: {
        ...paymentResult,
        courseId,
        enrollmentStatus: 'active'
      }
    });

  } catch (error) {
    console.error('Payment route error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 