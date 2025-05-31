const db = require('../utils/db');

class Course {
  static async create({ title, description, mentorId, price, category }) {
    const result = await db.query(
      'INSERT INTO courses (title, description, mentor_id, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, mentorId, price, category]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT c.*, u.name as mentor_name FROM courses c JOIN users u ON c.mentor_id = u.id WHERE c.id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll({ category, limit = 10, offset = 0 }) {
    const query = category
      ? {
          text: 'SELECT c.*, u.name as mentor_name FROM courses c JOIN users u ON c.mentor_id = u.id WHERE category = $1 LIMIT $2 OFFSET $3',
          values: [category, limit, offset],
        }
      : {
          text: 'SELECT c.*, u.name as mentor_name FROM courses c JOIN users u ON c.mentor_id = u.id LIMIT $1 OFFSET $2',
          values: [limit, offset],
        };

    const result = await db.query(query.text, query.values);
    return result.rows;
  }

  static async findByMentorId(mentorId) {
    const result = await db.query(
      'SELECT * FROM courses WHERE mentor_id = $1',
      [mentorId]
    );
    return result.rows;
  }
}

module.exports = Course; 