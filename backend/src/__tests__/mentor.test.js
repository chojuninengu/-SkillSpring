const request = require('supertest');
const app = require('../app');
const {
  loginTestUser,
  createTestUser,
  createTestCourse,
  enrollInCourse
} = require('./helpers/testHelpers');
const db = require('../utils/db');

describe('Mentor Assignment API', () => {
  let mentorToken;
  let studentToken;
  let mentorId;
  let courseId;

  beforeEach(async () => {
    // Login as test mentor
    mentorToken = await loginTestUser('mentor@test.com', 'testpass123');
    
    // Get mentor ID
    const mentorResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${mentorToken}`);
    mentorId = mentorResponse.body.data.id;

    // Login as test student
    studentToken = await loginTestUser('student@test.com', 'testpass123');

    // Get test course ID
    const courseResult = await db.query('SELECT id FROM courses LIMIT 1');
    courseId = courseResult.rows[0].id;
  });

  describe('Mentor Capacity Management', () => {
    it('should track mentor capacity correctly', async () => {
      // Get initial capacity
      const initialCapacity = await db.query(
        'SELECT current_students FROM mentor_capacity WHERE mentor_id = $1',
        [mentorId]
      );

      // Enroll a student
      await enrollInCourse(studentToken, courseId);

      // Check updated capacity
      const updatedCapacity = await db.query(
        'SELECT current_students FROM mentor_capacity WHERE mentor_id = $1',
        [mentorId]
      );

      expect(updatedCapacity.rows[0].current_students)
        .toBe(initialCapacity.rows[0].current_students + 1);
    });

    it('should not exceed maximum capacity', async () => {
      // Set mentor to max capacity
      await db.query(
        'UPDATE mentor_capacity SET current_students = max_students WHERE mentor_id = $1',
        [mentorId]
      );

      // Create new student
      const newStudent = await createTestUser(
        'New Student',
        'newstudent@test.com',
        'testpass123',
        'student'
      );
      const newStudentToken = await loginTestUser('newstudent@test.com', 'testpass123');

      // Try to enroll
      const response = await request(app)
        .post(`/api/enrollments/${courseId}`)
        .set('Authorization', `Bearer ${newStudentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/no available mentors/i);
    });
  });

  describe('Mentor Assignment Logic', () => {
    it('should assign mentor with lowest current load', async () => {
      // Create additional mentor with lower load
      const newMentor = await createTestUser(
        'New Mentor',
        'newmentor@test.com',
        'testpass123',
        'mentor'
      );

      // Set up capacity for new mentor
      await db.query(
        `INSERT INTO mentor_capacity (mentor_id, current_students, max_students)
         VALUES ($1, 0, 5)`,
        [newMentor.id]
      );

      // Set higher load for existing mentor
      await db.query(
        'UPDATE mentor_capacity SET current_students = 3 WHERE mentor_id = $1',
        [mentorId]
      );

      // Enroll new student
      const response = await enrollInCourse(studentToken, courseId);

      // Check assigned mentor
      const enrollment = await db.query(
        'SELECT mentor_id FROM enrollments WHERE id = $1',
        [response.id]
      );

      expect(enrollment.rows[0].mentor_id).toBe(newMentor.id);
    });

    it('should update mentor stats after assignment', async () => {
      const initialStats = await db.query(
        `SELECT 
           COUNT(*) as total_students,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_courses
         FROM enrollments
         WHERE mentor_id = $1`,
        [mentorId]
      );

      // Enroll and complete a course
      const enrollment = await enrollInCourse(studentToken, courseId);
      await request(app)
        .patch(`/api/enrollments/${enrollment.id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      const updatedStats = await db.query(
        `SELECT 
           COUNT(*) as total_students,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_courses
         FROM enrollments
         WHERE mentor_id = $1`,
        [mentorId]
      );

      expect(parseInt(updatedStats.rows[0].total_students))
        .toBe(parseInt(initialStats.rows[0].total_students) + 1);
      expect(parseInt(updatedStats.rows[0].completed_courses))
        .toBe(parseInt(initialStats.rows[0].completed_courses) + 1);
    });
  });

  describe('GET /api/mentors/stats', () => {
    it('should return mentor statistics', async () => {
      const response = await request(app)
        .get('/api/mentors/stats')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentStudents');
      expect(response.body.data).toHaveProperty('maxStudents');
      expect(response.body.data).toHaveProperty('completedCourses');
    });

    it('should only allow mentors to access stats', async () => {
      const response = await request(app)
        .get('/api/mentors/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/mentors/:mentorId/students', () => {
    it('should list assigned students', async () => {
      // Enroll a student first
      await enrollInCourse(studentToken, courseId);

      const response = await request(app)
        .get(`/api/mentors/${mentorId}/students`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('student');
      expect(response.body.data[0]).toHaveProperty('course');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should not allow mentors to view other mentors\' students', async () => {
      const otherMentor = await createTestUser(
        'Other Mentor',
        'othermentor@test.com',
        'testpass123',
        'mentor'
      );
      const otherMentorToken = await loginTestUser('othermentor@test.com', 'testpass123');

      const response = await request(app)
        .get(`/api/mentors/${mentorId}/students`)
        .set('Authorization', `Bearer ${otherMentorToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 