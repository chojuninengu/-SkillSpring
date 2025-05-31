const express = require('express');
const router = express.Router();
const { 
  getAllCourses, 
  createCourse, 
  getCourseById, 
  enrollInCourse 
} = require('../controllers/courseController');
const { authenticateToken, isMentor } = require('../middleware/auth');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', authenticateToken, isMentor, createCourse);
router.post('/:id/enroll', authenticateToken, enrollInCourse);

module.exports = router; 