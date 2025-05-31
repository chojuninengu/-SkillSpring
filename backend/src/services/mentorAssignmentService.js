const db = require('../config/database');

class MentorAssignmentService {
  static async assignMentorToStudent(studentId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get available mentor with least current students
      const mentorResult = await client.query(`
        SELECT m.mentor_id, mc.current_students 
        FROM users m
        JOIN mentor_capacity mc ON m.id = mc.mentor_id
        WHERE m.role = 'mentor'
        AND mc.current_students < mc.max_students
        ORDER BY mc.current_students ASC
        LIMIT 1
        FOR UPDATE
      `);

      if (mentorResult.rows.length === 0) {
        throw new Error('No available mentors found');
      }

      const mentorId = mentorResult.rows[0].mentor_id;

      // Update student's mentor_id
      await client.query(
        'UPDATE users SET mentor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [mentorId, studentId]
      );

      // Increment mentor's current_students count
      await client.query(
        'UPDATE mentor_capacity SET current_students = current_students + 1, updated_at = CURRENT_TIMESTAMP WHERE mentor_id = $1',
        [mentorId]
      );

      await client.query('COMMIT');
      return mentorId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async initializeMentorCapacity(mentorId, maxStudents = 5) {
    const result = await db.query(
      'INSERT INTO mentor_capacity (mentor_id, max_students) VALUES ($1, $2) RETURNING *',
      [mentorId, maxStudents]
    );
    return result.rows[0];
  }

  static async updateMentorCapacity(mentorId, maxStudents) {
    const result = await db.query(
      'UPDATE mentor_capacity SET max_students = $1, updated_at = CURRENT_TIMESTAMP WHERE mentor_id = $2 RETURNING *',
      [maxStudents, mentorId]
    );
    return result.rows[0];
  }

  static async getMentorStats(mentorId) {
    const result = await db.query(
      'SELECT current_students, max_students FROM mentor_capacity WHERE mentor_id = $1',
      [mentorId]
    );
    return result.rows[0];
  }
}

module.exports = MentorAssignmentService; 