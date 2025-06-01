const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');
const { authenticateToken } = require('../middleware/auth');

// Initiate payment
router.post('/initiate', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const payment = await PaymentService.initiatePayment(userId, courseId);
        res.json(payment);
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to initiate payment' 
        });
    }
});

// Payment status update endpoint
router.post('/status-update', async (req, res) => {
    try {
        const { paymentId, status } = req.body;
        
        if (!paymentId || !status) {
            return res.status(400).json({ 
                error: 'Payment ID and status are required' 
            });
        }

        await PaymentService.handlePaymentUpdate(paymentId, status);
        res.json({ success: true });
    } catch (error) {
        console.error('Payment status update error:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to update payment status' 
        });
    }
});

module.exports = router; 