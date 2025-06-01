const db = require('../utils/db');

class MentorAssignment {
  static async findAvailableMentor() {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, mc.current_students, mc.max_students
       FROM users u
       JOIN mentor_capacity mc ON u.id = mc.mentor_id
       WHERE u.role = 'mentor'
       AND mc.current_students < mc.max_students
       ORDER BY mc.current_students ASC
       LIMIT 1`
    );

    return result.rows[0];
  }

  static async assignMentorToStudent(studentId, mentorId) {
    // Start a transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update the student's mentor_id
      await client.query(
        'UPDATE users SET mentor_id = $1 WHERE id = $2',
        [mentorId, studentId]
      );

      // Increment the mentor's current_students count
      await client.query(
        `UPDATE mentor_capacity 
         SET current_students = current_students + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE mentor_id = $1`,
        [mentorId]
      );

      await client.query('COMMIT');

      // Return the updated mentor info
      const result = await client.query(
        `SELECT u.id, u.name, u.email, mc.current_students, mc.max_students
         FROM users u
         JOIN mentor_capacity mc ON u.id = mc.mentor_id
         WHERE u.id = $1`,
        [mentorId]
      );

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMentorStats(mentorId) {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, mc.current_students, mc.max_students,
              COUNT(DISTINCT s.id) as total_students,
              COUNT(DISTINCT p.id) as total_projects,
              COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as pending_projects
       FROM users u
       JOIN mentor_capacity mc ON u.id = mc.mentor_id
       LEFT JOIN users s ON s.mentor_id = u.id
       LEFT JOIN projects p ON p.mentor_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.email, mc.current_students, mc.max_students`,
      [mentorId]
    );

    return result.rows[0];
  }

  static async initializeMentorCapacity(mentorId, maxStudents = 5) {
    const result = await db.query(
      `INSERT INTO mentor_capacity (mentor_id, max_students, current_students)
       VALUES ($1, $2, 0)
       ON CONFLICT (mentor_id) DO UPDATE
       SET max_students = $2
       RETURNING *`,
      [mentorId, maxStudents]
    );

    return result.rows[0];
  }
}

module.exports = MentorAssignment; 