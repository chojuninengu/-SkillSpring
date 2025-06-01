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

// Webhook endpoint
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-nkwa-signature'];
        if (!signature) {
            return res.status(401).json({ error: 'Missing signature' });
        }

        await PaymentService.handleWebhook(req.body, signature);
        res.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to process webhook' 
        });
    }
});

module.exports = router; 