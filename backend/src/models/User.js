const db = require('../utils/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
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
}

module.exports = User; 