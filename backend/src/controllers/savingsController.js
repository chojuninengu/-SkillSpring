const Savings = require('../models/Savings');

const getUserSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const savings = await Savings.getUserSavings(userId);

    res.status(200).json({
      success: true,
      data: {
        amount: parseFloat(savings.savings_amount),
        goal: parseFloat(savings.savings_goal),
        lastUpdated: savings.savings_last_updated
      }
    });
  } catch (error) {
    console.error('Error fetching user savings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching savings information'
    });
  }
};

const updateSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, type, description } = req.body;

    if (!['deposit', 'withdraw'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const result = await Savings.updateSavings(userId, amount, type, description);

    res.status(200).json({
      success: true,
      data: {
        currentAmount: parseFloat(result.savings_amount),
        goal: parseFloat(result.savings_goal)
      }
    });
  } catch (error) {
    console.error('Error updating savings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating savings'
    });
  }
};

const setSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal } = req.body;

    if (goal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Goal amount cannot be negative'
      });
    }

    const result = await Savings.setSavingsGoal(userId, goal);

    res.status(200).json({
      success: true,
      data: {
        currentAmount: parseFloat(result.savings_amount),
        goal: parseFloat(result.savings_goal)
      }
    });
  } catch (error) {
    console.error('Error setting savings goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting savings goal'
    });
  }
};

const getSavingsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;
    
    const history = await Savings.getSavingsHistory(userId, {
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    });

    res.status(200).json({
      success: true,
      data: history.map(record => ({
        id: record.id,
        amount: parseFloat(record.amount),
        type: record.transaction_type,
        description: record.description,
        date: record.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching savings history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching savings history'
    });
  }
};

const getStartupSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const suggestions = await Savings.getStartupSuggestionsBySavings(userId);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching startup suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching startup suggestions'
    });
  }
};

module.exports = {
  getUserSavings,
  updateSavings,
  setSavingsGoal,
  getSavingsHistory,
  getStartupSuggestions
}; 