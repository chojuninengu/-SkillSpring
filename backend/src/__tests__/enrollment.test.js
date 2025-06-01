const request = require('supertest');
const app = require('../app');
const {
  loginTestUser,
  createTestUser,
  createTestCourse,
  enrollInCourse
} = require('./helpers/testHelpers');
const db = require('../utils/db');

describe('Enrollment API', () => {
  let studentToken;
  let courseId;
  let studentId;

  beforeEach(async () => {
    // Login as test student
    studentToken = await loginTestUser('student@test.com', 'testpass123');
    
    // Get student ID
    const userResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);
    studentId = userResponse.body.data.id;

    // Get test course ID
    const courseResult = await db.query('SELECT id FROM courses LIMIT 1');
    courseId = courseResult.rows[0].id;
  });

  describe('POST /api/enrollments/:courseId', () => {
    it('should enroll student in a course successfully', async () => {
      const response = await request(app)
        .post(`/api/enrollments/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should not allow duplicate enrollment', async () => {
      // First enrollment
      await enrollInCourse(studentToken, courseId);

      // Try to enroll again
      const response = await request(app)
        .post(`/api/enrollments/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already enrolled/i);
    });

    it('should not enroll in non-existent course', async () => {
      const response = await request(app)
        .post('/api/enrollments/999999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should assign a mentor automatically', async () => {
      const response = await request(app)
        .post(`/api/enrollments/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(201);
      
      // Check if mentor was assigned
      const enrollmentResult = await db.query(
        'SELECT mentor_id FROM enrollments WHERE id = $1',
        [response.body.data.id]
      );
      
      expect(enrollmentResult.rows[0].mentor_id).toBeTruthy();
    });
  });

  describe('GET /api/enrollments', () => {
    it('should list student enrollments', async () => {
      // Create an enrollment first
      await enrollInCourse(studentToken, courseId);

      const response = await request(app)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should include course and mentor details', async () => {
      await enrollInCourse(studentToken, courseId);

      const response = await request(app)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.body.data[0]).toHaveProperty('course');
      expect(response.body.data[0]).toHaveProperty('mentor');
      expect(response.body.data[0].course).toHaveProperty('title');
      expect(response.body.data[0].mentor).toHaveProperty('name');
    });
  });

  describe('PATCH /api/enrollments/:enrollmentId/complete', () => {
    it('should mark enrollment as completed', async () => {
      // Create enrollment
      const enrollmentResponse = await enrollInCourse(studentToken, courseId);
      const enrollmentId = enrollmentResponse.id;

      const response = await request(app)
        .patch(`/api/enrollments/${enrollmentId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.completed_at).toBeTruthy();
    });

    it('should not complete non-existent enrollment', async () => {
      const response = await request(app)
        .patch('/api/enrollments/999999/complete')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not complete another student\'s enrollment', async () => {
      // Create another student and enroll them
      const otherStudent = await createTestUser(
        'Other Student',
        'other@test.com',
        'testpass123',
        'student'
      );
      const otherStudentToken = await loginTestUser('other@test.com', 'testpass123');
      const otherEnrollment = await enrollInCourse(otherStudentToken, courseId);

      // Try to complete their enrollment
      const response = await request(app)
        .patch(`/api/enrollments/${otherEnrollment.id}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 