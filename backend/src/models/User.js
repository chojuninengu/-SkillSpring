const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const MentorAssignmentService = require('../services/mentorAssignmentService');

const VALID_ROLES = ['student', 'mentor', 'admin'];

class User {
  static async create({ email, password, name, role }) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid role specified');
    }

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        [email, hashedPassword, name, role]
      );
      
      const user = userResult.rows[0];

      // If user is a mentor, initialize their capacity
      if (role === 'mentor') {
        await MentorAssignmentService.initializeMentorCapacity(user.id);
      }
      
      // If user is a student, assign a mentor
      if (role === 'student') {
        try {
          await MentorAssignmentService.assignMentorToStudent(user.id);
        } catch (error) {
          console.error('Failed to assign mentor:', error);
          // Continue with user creation even if mentor assignment fails
        }
      }

      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateRole(userId, newRole) {
    if (!VALID_ROLES.includes(newRole)) {
      throw new Error('Invalid role specified');
    }

    const result = await db.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, role',
      [newRole, userId]
    );
    return result.rows[0];
  }

  static async findByRole(role, { limit = 10, offset = 0 } = {}) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid role specified');
    }

    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [role, limit, offset]
    );
    return result.rows;
  }

  static async countByRole(role) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid role specified');
    }

    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      [role]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = User; 