const db = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

const NKWA_API_URL = process.env.NKWA_API_URL || 'https://api.nkwa.cm/pay';
const NKWA_API_KEY = process.env.NKWA_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

class PaymentService {
    static generateTransactionRef() {
        return `SKS-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }

    static async initiatePayment(userId, courseId) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Get course and user details
            const courseResult = await client.query(
                'SELECT price FROM courses WHERE id = $1',
                [courseId]
            );

            const userResult = await client.query(
                'SELECT phone FROM users WHERE id = $1',
                [userId]
            );

            if (!courseResult.rows.length || !userResult.rows.length) {
                throw new Error('Invalid course or user');
            }

            // Check if user is already enrolled
            const enrollmentCheck = await client.query(
                'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
                [userId, courseId]
            );

            if (enrollmentCheck.rows.length > 0) {
                throw new Error('User is already enrolled in this course');
            }

            const course = courseResult.rows[0];
            const user = userResult.rows[0];
            const transactionRef = this.generateTransactionRef();

            // Create pending payment record
            const paymentResult = await client.query(
                `INSERT INTO payments (user_id, course_id, status, amount, transaction_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [userId, courseId, 'pending', course.price, transactionRef]
            );

            // Call Nkwa API
            const nkwaResponse = await axios.post(NKWA_API_URL, {
                phone: user.phone,
                amount: course.price,
                transactionRef,
                metadata: {
                    userId,
                    courseId,
                    paymentId: paymentResult.rows[0].id
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${NKWA_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            await client.query('COMMIT');

            return {
                transactionId: transactionRef,
                amount: course.price,
                status: 'pending'
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async handleWebhook(payload, signature) {
        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (signature !== expectedSignature) {
            throw new Error('Invalid webhook signature');
        }

        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            const { transactionId, status, paymentId } = payload;

            // Update payment status
            const paymentResult = await client.query(
                `UPDATE payments 
                 SET status = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE transaction_id = $2 AND id = $3
                 RETURNING user_id, course_id`,
                [status, transactionId, paymentId]
            );

            if (!paymentResult.rows.length) {
                throw new Error('Payment not found');
            }

            // If payment successful, create enrollment
            if (status === 'success') {
                const { user_id, course_id } = paymentResult.rows[0];
                
                await client.query(
                    `INSERT INTO enrollments (user_id, course_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, course_id) DO NOTHING`,
                    [user_id, course_id]
                );
            }

            await client.query('COMMIT');
            return { success: true };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = PaymentService; 