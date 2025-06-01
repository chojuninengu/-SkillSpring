const db = require('../utils/db');
const StartupSuggestion = require('./StartupSuggestion');

class Savings {
  static async getUserSavings(userId) {
    const result = await db.query(
      `SELECT savings_amount, savings_goal, savings_last_updated
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  static async updateSavings(userId, amount, type, description) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update user's savings amount
      const updateResult = await client.query(
        `UPDATE users
         SET savings_amount = CASE
           WHEN $2 = 'deposit' THEN savings_amount + $3
           WHEN $2 = 'withdraw' THEN GREATEST(0, savings_amount - $3)
           ELSE savings_amount
         END
         WHERE id = $1
         RETURNING savings_amount, savings_goal`,
        [userId, type, amount]
      );

      // Record transaction in history
      await client.query(
        `INSERT INTO savings_history (user_id, amount, transaction_type, description)
         VALUES ($1, $2, $3, $4)`,
        [userId, amount, type, description]
      );

      await client.query('COMMIT');

      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async setSavingsGoal(userId, goal) {
    const result = await db.query(
      `UPDATE users
       SET savings_goal = $2
       WHERE id = $1
       RETURNING savings_amount, savings_goal`,
      [userId, goal]
    );
    return result.rows[0];
  }

  static async getSavingsHistory(userId, { limit = 10, offset = 0 } = {}) {
    const result = await db.query(
      `SELECT id, amount, transaction_type, description, created_at
       FROM savings_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getStartupSuggestionsBySavings(userId) {
    const client = await db.pool.connect();
    try {
      // Get user's savings and completed courses
      const userResult = await client.query(
        `SELECT u.savings_amount,
                ARRAY_AGG(DISTINCT c.category) as completed_categories
         FROM users u
         LEFT JOIN enrollments e ON e.student_id = u.id
         LEFT JOIN courses c ON e.course_id = c.id
         WHERE u.id = $1 AND e.status = 'completed'
         GROUP BY u.id, u.savings_amount`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const { savings_amount, completed_categories } = userResult.rows[0];

      // Get startup suggestions based on completed categories
      const suggestions = await StartupSuggestion.getSuggestionsForStudent(userId);
      
      // Filter and annotate suggestions based on savings
      return suggestions.suggestions.map(idea => {
        let affordability = 'not_ready';
        let savingsMessage = '';

        const investmentMap = {
          'Low': 5000,
          'Medium': 15000,
          'High': 50000
        };

        const requiredAmount = investmentMap[idea.initialInvestment] || 0;

        if (savings_amount >= requiredAmount) {
          affordability = 'ready';
          savingsMessage = "You've saved enough to start this venture!";
        } else {
          const remaining = requiredAmount - savings_amount;
          affordability = 'saving';
          savingsMessage = `Save $${remaining.toFixed(2)} more to start this venture`;
        }

        return {
          ...idea,
          affordability,
          savingsMessage,
          requiredAmount
        };
      });
    } finally {
      client.release();
    }
  }
}

module.exports = Savings; 