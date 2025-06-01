const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
  assignMentorToStudent,
  getMentorStats,
  initializeMentorCapacity
} = require('../controllers/mentorAssignmentController');

// Assign a mentor to a student (admin only)
router.post('/assign/:studentId',
  authenticateToken,
  isAdmin,
  assignMentorToStudent
);

// Get mentor statistics
router.get('/stats/:mentorId',
  authenticateToken,
  getMentorStats
);

// Initialize or update mentor capacity (admin only)
router.post('/capacity/:mentorId',
  authenticateToken,
  isAdmin,
  initializeMentorCapacity
);

module.exports = router; 