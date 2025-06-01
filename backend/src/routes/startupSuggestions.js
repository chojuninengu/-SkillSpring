const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent } = require('../middleware/auth');
const {
  getSuggestionsForCourse,
  getSuggestionsForStudent
} = require('../controllers/startupSuggestionController');

// Get startup suggestions for a specific course
router.get('/course/:courseId',
  authenticateToken,
  isStudent,
  getSuggestionsForCourse
);

// Get personalized startup suggestions based on completed courses
router.get('/student',
  authenticateToken,
  isStudent,
  getSuggestionsForStudent
);

module.exports = router; 