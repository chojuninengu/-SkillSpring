const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
  assignMentor,
  updateMentorCapacity,
  getMentorStats
} = require('../controllers/mentorController');

// Assign mentor to student (Admin only)
router.post('/assign/:studentId', authenticateToken, isAdmin, assignMentor);

// Update mentor capacity (Admin only)
router.put('/:mentorId/capacity', authenticateToken, isAdmin, updateMentorCapacity);

// Get mentor stats
router.get('/:mentorId/stats', authenticateToken, getMentorStats);

module.exports = router; 