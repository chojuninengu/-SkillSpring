const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent } = require('../middleware/auth');
const {
  getUserSavings,
  updateSavings,
  setSavingsGoal,
  getSavingsHistory,
  getStartupSuggestions
} = require('../controllers/savingsController');

// Get user's savings information
router.get('/',
  authenticateToken,
  isStudent,
  getUserSavings
);

// Update savings amount (deposit/withdraw)
router.post('/update',
  authenticateToken,
  isStudent,
  updateSavings
);

// Set savings goal
router.post('/goal',
  authenticateToken,
  isStudent,
  setSavingsGoal
);

// Get savings transaction history
router.get('/history',
  authenticateToken,
  isStudent,
  getSavingsHistory
);

// Get startup suggestions based on savings
router.get('/suggestions',
  authenticateToken,
  isStudent,
  getStartupSuggestions
);

module.exports = router; 