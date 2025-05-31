const db = require('../utils/db');

class Enrollment {
  static async create({ courseId, studentId, status }) {
    const result = await db.query(
      'INSERT INTO enrollments (course_id, student_id, status) VALUES ($1, $2, $3) RETURNING *',
      [courseId, studentId, status]
    );
    return result.rows[0];
  }

  static async findByCourseAndStudent(courseId, studentId) {
    const result = await db.query(
      'SELECT * FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );
    return result.rows[0];
  }

  static async findByStudent(studentId) {
    const result = await db.query(
      `SELECT e.*, c.title, c.description, c.category, u.name as mentor_name 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       JOIN users u ON c.mentor_id = u.id 
       WHERE e.student_id = $1`,
      [studentId]
    );
    return result.rows;
  }

  static async updateStatus({ courseId, studentId, status }) {
    const result = await db.query(
      'UPDATE enrollments SET status = $1, completed_at = CASE WHEN $1 = \'completed\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE course_id = $2 AND student_id = $3 RETURNING *',
      [status, courseId, studentId]
    );
    return result.rows[0];
  }

  static async getCompletedCourses(studentId) {
    const result = await db.query(
      `SELECT e.*, c.title, c.category 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.student_id = $1 AND e.status = 'completed'`,
      [studentId]
    );
    return result.rows;
  }
}

module.exports = Enrollment; 