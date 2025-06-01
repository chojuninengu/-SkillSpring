const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const config = require('../../config');

const generateTestToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
};

const loginTestUser = async (email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.body.data.token;
};

const createTestUser = async (name, email, password, role) => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, role });
  
  return response.body.data;
};

const createTestCourse = async (token, courseData) => {
  const response = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${token}`)
    .send(courseData);
  
  return response.body.data;
};

const enrollInCourse = async (token, courseId) => {
  const response = await request(app)
    .post(`/api/enrollments/${courseId}`)
    .set('Authorization', `Bearer ${token}`);
  
  return response.body.data;
};

module.exports = {
  generateTestToken,
  loginTestUser,
  createTestUser,
  createTestCourse,
  enrollInCourse
}; 