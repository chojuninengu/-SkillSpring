const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const MentorAssignmentService = require('../services/mentorAssignmentService');
const MentorAssignment = require('./MentorAssignment');

const VALID_ROLES = ['student', 'mentor', 'admin'];

class User {
  static async register({ name, email, password, role }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        [name, email, hashedPassword, role]
      );

      const user = userResult.rows[0];

      // If registering as a mentor, initialize their capacity
      if (role === 'mentor') {
        await client.query(
          `INSERT INTO mentor_capacity (mentor_id, max_students, current_students)
           VALUES ($1, $2, $3)`,
          [user.id, 5, 0]  // Default max_students is 5
        );
      }

      // If registering as a student, assign a mentor automatically
      if (role === 'student') {
        const availableMentor = await MentorAssignment.findAvailableMentor();
        
        if (availableMentor) {
          // Update student's mentor_id
          await client.query(
            'UPDATE users SET mentor_id = $1 WHERE id = $2',
            [availableMentor.id, user.id]
          );

          // Update mentor's current_students count
          await client.query(
            `UPDATE mentor_capacity 
             SET current_students = current_students + 1
             WHERE mentor_id = $1`,
            [availableMentor.id]
          );

          user.mentor_id = availableMentor.id;
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

  static async authenticate(email, password) {
    const result = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static async getById(id) {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.mentor_id,
              m.name as mentor_name, m.email as mentor_email
       FROM users u
       LEFT JOIN users m ON u.mentor_id = m.id
       WHERE u.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async updateProfile(id, { name, email }) {
    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, role`,
      [name, email, id]
    );

    return result.rows[0];
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