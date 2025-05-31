const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../utils/payment');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

/**
 * @route POST /api/payments/collect
 * @desc Initiate a mobile money payment collection
 * @access Private (requires authentication)
 */
router.post('/collect', auth, async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    // Initiate payment
    const paymentResult = await initiatePayment(amount, phoneNumber);

    // Return success response
    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentResult
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