const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent, isMentor } = require('../middleware/auth');
const {
  getStudentDashboard,
  getMentorDashboard
} = require('../controllers/dashboardController');

// Student dashboard route
router.get('/student',
  authenticateToken,
  isStudent,
  getStudentDashboard
);

// Mentor dashboard route
router.get('/mentor',
  authenticateToken,
  isMentor,
  getMentorDashboard
);

module.exports = router; 