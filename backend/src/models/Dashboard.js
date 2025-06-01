const db = require('../utils/db');

class Dashboard {
  static async getStudentStats(studentId) {
    const client = await db.pool.connect();
    try {
      const stats = {};
      
      // Get enrollment and course progress
      const enrollmentResult = await client.query(
        `SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses,
          COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_courses
         FROM enrollments e
         WHERE e.student_id = $1`,
        [studentId]
      );
      stats.courses = enrollmentResult.rows[0];

      // Get project statistics
      const projectResult = await client.query(
        `SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_projects
         FROM projects
         WHERE student_id = $1`,
        [studentId]
      );
      stats.projects = projectResult.rows[0];

      // Get mentor information
      const mentorResult = await client.query(
        `SELECT 
          m.id, m.name, m.email,
          COUNT(DISTINCT p.id) as total_reviewed_projects
         FROM users s
         JOIN users m ON s.mentor_id = m.id
         LEFT JOIN projects p ON p.mentor_id = m.id AND p.status = 'reviewed'
         WHERE s.id = $1
         GROUP BY m.id, m.name, m.email`,
        [studentId]
      );
      stats.mentor = mentorResult.rows[0];

      // Get saved courses
      const savedCoursesResult = await client.query(
        `SELECT c.id, c.title, c.description, c.category, c.price
         FROM courses c
         JOIN enrollments e ON e.course_id = c.id
         WHERE e.student_id = $1 AND e.status = 'active'
         ORDER BY e.enrolled_at DESC
         LIMIT 5`,
        [studentId]
      );
      stats.savedCourses = savedCoursesResult.rows;

      return stats;
    } finally {
      client.release();
    }
  }

  static async getMentorStats(mentorId) {
    const client = await db.pool.connect();
    try {
      const stats = {};

      // Get mentee statistics
      const menteeResult = await client.query(
        `SELECT 
          COUNT(DISTINCT s.id) as total_mentees,
          COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN s.id END) as active_mentees
         FROM users s
         LEFT JOIN projects p ON p.student_id = s.id
         WHERE s.mentor_id = $1`,
        [mentorId]
      );
      stats.mentees = menteeResult.rows[0];

      // Get project review statistics
      const projectResult = await client.query(
        `SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reviews,
          COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as completed_reviews
         FROM projects
         WHERE mentor_id = $1`,
        [mentorId]
      );
      stats.projects = projectResult.rows[0];

      // Get recent mentees with pending projects
      const pendingReviewsResult = await client.query(
        `SELECT 
          s.id, s.name, s.email,
          p.id as project_id, p.title as project_title,
          p.submitted_at
         FROM users s
         JOIN projects p ON p.student_id = s.id
         WHERE p.mentor_id = $1 AND p.status = 'pending'
         ORDER BY p.submitted_at ASC
         LIMIT 5`,
        [mentorId]
      );
      stats.pendingReviews = pendingReviewsResult.rows;

      // Get mentee list with their progress
      const menteeListResult = await client.query(
        `SELECT 
          s.id, s.name, s.email,
          COUNT(DISTINCT e.course_id) as enrolled_courses,
          COUNT(DISTINCT CASE WHEN p.status = 'reviewed' THEN p.id END) as completed_projects
         FROM users s
         LEFT JOIN enrollments e ON e.student_id = s.id
         LEFT JOIN projects p ON p.student_id = s.id
         WHERE s.mentor_id = $1
         GROUP BY s.id, s.name, s.email
         ORDER BY s.name`,
        [mentorId]
      );
      stats.menteeList = menteeListResult.rows;

      return stats;
    } finally {
      client.release();
    }
  }
}

module.exports = Dashboard; 