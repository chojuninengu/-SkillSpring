const db = require('../utils/db');
const bcrypt = require('bcryptjs');

// Global setup - runs once before all tests
beforeAll(async () => {
  // Create test tables and seed initial data
  await setupTestDatabase();
});

// Global teardown - runs once after all tests
afterAll(async () => {
  await cleanupTestDatabase();
  await db.pool.end();
});

// Reset database before each test
beforeEach(async () => {
  await resetTestData();
});

async function setupTestDatabase() {
  // Create necessary tables
  await db.query(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      savings_amount DECIMAL(10,2) DEFAULT 0.00,
      savings_goal DECIMAL(10,2) DEFAULT 0.00,
      savings_last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Courses table
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      mentor_id INTEGER REFERENCES users(id)
    );

    -- Enrollments table
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id),
      course_id INTEGER REFERENCES courses(id),
      status VARCHAR(50) DEFAULT 'in_progress',
      enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    );

    -- Mentor capacity table
    CREATE TABLE IF NOT EXISTS mentor_capacity (
      mentor_id INTEGER REFERENCES users(id) PRIMARY KEY,
      current_students INTEGER DEFAULT 0,
      max_students INTEGER DEFAULT 5
    );
  `);
}

async function cleanupTestDatabase() {
  // Drop all test tables
  await db.query(`
    DROP TABLE IF EXISTS enrollments CASCADE;
    DROP TABLE IF EXISTS mentor_capacity CASCADE;
    DROP TABLE IF EXISTS courses CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}

async function resetTestData() {
  // Clear existing data
  await db.query(`
    TRUNCATE TABLE enrollments CASCADE;
    TRUNCATE TABLE mentor_capacity CASCADE;
    TRUNCATE TABLE courses CASCADE;
    TRUNCATE TABLE users CASCADE;
  `);

  // Create test users
  const hashedPassword = await bcrypt.hash('testpass123', 10);
  
  // Insert test mentor
  const mentorResult = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    ['Test Mentor', 'mentor@test.com', hashedPassword, 'mentor']
  );
  const mentorId = mentorResult.rows[0].id;

  // Insert test student
  const studentResult = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    ['Test Student', 'student@test.com', hashedPassword, 'student']
  );
  const studentId = studentResult.rows[0].id;

  // Set up mentor capacity
  await db.query(
    `INSERT INTO mentor_capacity (mentor_id, current_students, max_students)
     VALUES ($1, $2, $3)`,
    [mentorId, 0, 5]
  );

  // Insert test course
  await db.query(
    `INSERT INTO courses (title, description, price, category, mentor_id)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Test Course', 'Test Description', 99.99, 'programming', mentorId]
  );
}

// Export test data for use in tests
module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  resetTestData
}; 