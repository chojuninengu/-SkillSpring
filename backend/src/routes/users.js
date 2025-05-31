const express = require('express');
const router = express.Router();
const { 
  updateUserRole, 
  getUsersByRole, 
  getCurrentUser 
} = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Protected routes - require authentication
router.get('/me', authenticateToken, getCurrentUser);

// Admin only routes
router.put('/:userId/role', authenticateToken, isAdmin, updateUserRole);
router.get('/role/:role', authenticateToken, isAdmin, getUsersByRole);

module.exports = router; 