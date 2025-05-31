const db = require('../utils/db');

class Project {
  static async submit({ studentId, title, description, githubUrl, submissionFilePath }) {
    // Get the student's assigned mentor
    const mentorResult = await db.query(
      'SELECT mentor_id FROM users WHERE id = $1',
      [studentId]
    );

    if (!mentorResult.rows[0]?.mentor_id) {
      throw new Error('Student does not have an assigned mentor');
    }

    const mentorId = mentorResult.rows[0].mentor_id;

    const result = await db.query(
      `INSERT INTO projects 
       (student_id, mentor_id, title, description, github_url, submission_file_path, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
      [studentId, mentorId, title, description, githubUrl, submissionFilePath]
    );

    return result.rows[0];
  }

  static async getPendingByMentor(mentorId, { limit = 10, offset = 0 } = {}) {
    const result = await db.query(
      `SELECT p.*, u.name as student_name, u.email as student_email
       FROM projects p
       JOIN users u ON p.student_id = u.id
       WHERE p.mentor_id = $1 AND p.status = 'pending'
       ORDER BY p.submitted_at ASC
       LIMIT $2 OFFSET $3`,
      [mentorId, limit, offset]
    );

    return result.rows;
  }

  static async review({ projectId, feedback, status }) {
    if (!['reviewed', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Must be either "reviewed" or "rejected"');
    }

    const result = await db.query(
      `UPDATE projects 
       SET feedback = $1, 
           status = $2,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [feedback, status, projectId]
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    return result.rows[0];
  }

  static async getById(projectId) {
    const result = await db.query(
      `SELECT p.*, 
              u_student.name as student_name, 
              u_student.email as student_email,
              u_mentor.name as mentor_name
       FROM projects p
       JOIN users u_student ON p.student_id = u_student.id
       JOIN users u_mentor ON p.mentor_id = u_mentor.id
       WHERE p.id = $1`,
      [projectId]
    );

    return result.rows[0];
  }

  static async getByStudent(studentId, { limit = 10, offset = 0 } = {}) {
    const result = await db.query(
      `SELECT p.*, u.name as mentor_name
       FROM projects p
       JOIN users u ON p.mentor_id = u.id
       WHERE p.student_id = $1
       ORDER BY p.submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );

    return result.rows;
  }
}

module.exports = Project; 