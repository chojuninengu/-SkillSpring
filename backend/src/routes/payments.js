const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const axios = require('axios');
const mockPaymentService = require('../services/mockPayment');

// NKWA API configuration
const NKWA_API_URL = process.env.NKWA_API_URL || 'https://api.nkwa.dev/v1';
const NKWA_API_KEY = process.env.NKWA_API_KEY;

// Use mock payment in development, real NKWA in production
const isDevelopment = process.env.NODE_ENV !== 'production';

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

    // First, let's check what courses exist
    const courseCheck = await db.query('SELECT id, title, price FROM courses');
    console.log('Available courses in database:', courseCheck.rows);

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

    try {
      // Use mock payment service in development
      const paymentResponse = isDevelopment
        ? await mockPaymentService.initiatePayment({
            amount,
            phoneNumber,
            description: `Payment for course: ${course.title}`,
            external_reference: `course_${courseId}_user_${userId}_${Date.now()}`
          })
        : await axios.post(`${NKWA_API_URL}/collect`, {
            amount: amount,
            phone: phoneNumber,
            description: `Payment for course: ${course.title}`,
            external_reference: `course_${courseId}_user_${userId}_${Date.now()}`,
            callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/webhook`
          }, {
            headers: {
              'Authorization': `Bearer ${NKWA_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });

      // Create pending payment record
      const paymentResult = await db.query(
        'INSERT INTO payments (user_id, course_id, amount, status, phone_number, transaction_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, courseId, course.price, 'pending', phoneNumber, paymentResponse.transaction_id]
      );

      res.status(201).json({
        success: true,
        data: {
          payment: paymentResult.rows[0],
          transaction: paymentResponse
        },
        message: 'Payment initiated. Please wait while we process your payment.'
      });
    } catch (paymentError) {
      console.error('Payment service error:', paymentError);
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate payment. Please try again.'
      });
    }
  } catch (error) {
    console.error('Payment route error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Payment failed'
    });
  }
});

/**
 * @route POST /api/payments/webhook
 * @desc Handle NKWA payment webhook
 * @access Public
 */
router.post('/webhook', async (req, res) => {
  try {
    const { transaction_id, status, external_reference } = req.body;

    // Verify webhook signature if provided by NKWA
    // ... (implement webhook signature verification)

    // Update payment status
    const paymentResult = await db.query(
      'UPDATE payments SET status = $1 WHERE transaction_id = $2 RETURNING *',
      [status, transaction_id]
    );

    if (paymentResult.rows.length === 0) {
      console.error('Payment not found for transaction:', transaction_id);
      return res.status(404).send('Payment not found');
    }

    const payment = paymentResult.rows[0];

    // If payment is successful, create enrollment
    if (status === 'success') {
      await db.query(
        'INSERT INTO enrollments (user_id, course_id, progress) VALUES ($1, $2, $3)',
        [payment.user_id, payment.course_id, 0]
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * @route GET /api/payments/:id/status
 * @desc Check payment status
 * @access Private
 */
router.get('/:id/status', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.id;

    const payment = await db.query(
      `SELECT 
        p.*,
        c.title as course_title
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [paymentId, userId]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is pending, check status
    if (payment.rows[0].status === 'pending') {
      try {
        const statusResponse = isDevelopment
          ? await mockPaymentService.checkStatus(payment.rows[0].transaction_id)
          : await axios.get(
              `${NKWA_API_URL}/transactions/${payment.rows[0].transaction_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${NKWA_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );

        // Update payment status if changed
        if (statusResponse.status !== payment.rows[0].status) {
          await db.query(
            'UPDATE payments SET status = $1, completed_at = CASE WHEN $1 = \'success\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = $2',
            [statusResponse.status, paymentId]
          );

          // If payment is successful, create enrollment
          if (statusResponse.status === 'success') {
            await db.query(
              'INSERT INTO enrollments (user_id, course_id, progress) VALUES ($1, $2, $3)',
              [userId, payment.rows[0].course_id, 0]
            );
          }
        }

        return res.json({
          success: true,
          data: {
            ...payment.rows[0],
            status: statusResponse.status
          }
        });
      } catch (statusError) {
        console.error('Status check error:', statusError);
        return res.status(400).json({
          success: false,
          message: 'Failed to check payment status'
        });
      }
    }

    res.json({
      success: true,
      data: payment.rows[0]
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to check payment status'
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