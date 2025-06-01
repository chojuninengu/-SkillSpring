const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token payload');
      }

      // Get user from database
      const result = await db.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        console.log('User not found for ID:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request
      req.user = result.rows[0];
      req.token = token;

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        message: jwtError.name === 'TokenExpiredError' 
          ? 'Authentication token expired' 
          : 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware to check if user is a mentor
const isMentor = (req, res, next) => {
  if (req.user.role !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Mentor role required.'
    });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
};

module.exports = {
  auth,
  isMentor,
  isStudent
}; 