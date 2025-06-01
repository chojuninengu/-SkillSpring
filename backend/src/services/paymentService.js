const db = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');

const NKWA_API_URL = process.env.NKWA_API_URL || 'https://api.pay.staging.mynkwa.com/collect';
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

            // Ensure phone number is in correct format (2376XXXXXXX)
            const formattedPhone = this.formatPhoneNumber(user.phone);

            // Call Nkwa API
            const nkwaResponse = await axios.post(NKWA_API_URL, {
                amount: course.price,
                phoneNumber: formattedPhone
            }, {
                headers: {
                    'X-API-Key': NKWA_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const { data } = nkwaResponse;

            // Create payment record
            const paymentResult = await client.query(
                `INSERT INTO payments (
                    user_id, course_id, status, amount, transaction_id
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [
                    userId,
                    courseId,
                    data.status || 'pending',
                    course.price,
                    data.id // Using Nkwa's payment ID as our transaction ID
                ]
            );

            await client.query('COMMIT');

            return {
                paymentId: data.id,
                amount: course.price,
                status: data.status || 'pending',
                message: 'Payment initiated. Check Nkwa App to confirm.'
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static formatPhoneNumber(phone) {
        // Remove any non-digit characters
        const digits = phone.replace(/\D/g, '');
        
        // If number starts with '+237', remove it
        const withoutPrefix = digits.replace(/^(\+?237)/, '');
        
        // Ensure the number starts with '237'
        return withoutPrefix.startsWith('237') ? withoutPrefix : `237${withoutPrefix}`;
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

    static async handlePaymentUpdate(paymentId, status) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Update payment status
            const paymentResult = await client.query(
                `UPDATE payments 
                 SET status = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE transaction_id = $2
                 RETURNING user_id, course_id`,
                [status, paymentId]
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

    static async getPaymentStatus(paymentId) {
        const client = await db.pool.connect();
        
        try {
            // Get payment details from database
            const result = await client.query(
                `SELECT status, amount, created_at 
                 FROM payments 
                 WHERE transaction_id = $1`,
                [paymentId]
            );

            if (!result.rows.length) {
                throw new Error('Payment not found');
            }

            const payment = result.rows[0];

            // Check status from Nkwa API
            try {
                const response = await axios.get(
                    `${NKWA_API_URL}/status/${paymentId}`,
                    {
                        headers: {
                            'X-API-Key': NKWA_API_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const { data } = response;
                
                // If status has changed, update our database
                if (data.status && data.status !== payment.status) {
                    await this.handlePaymentUpdate(paymentId, data.status);
                    payment.status = data.status;
                }
            } catch (error) {
                console.error('Error checking Nkwa API status:', error);
                // Continue with our stored status if API check fails
            }

            return {
                status: payment.status,
                amount: payment.amount,
                createdAt: payment.created_at
            };

        } finally {
            client.release();
        }
    }
}

module.exports = PaymentService; 