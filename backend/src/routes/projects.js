const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, isMentor } = require('../middleware/auth');
const {
  submitProject,
  getPendingProjects,
  reviewProject,
  getStudentProjects
} = require('../controllers/projectController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.zip', '.rar', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, ZIP, RAR, and DOC files are allowed.'));
    }
  }
});

// Submit a project (students only)
router.post('/submit', 
  authenticateToken,
  upload.single('projectFile'),
  submitProject
);

// Get pending projects (mentors only)
router.get('/pending',
  authenticateToken,
  isMentor,
  getPendingProjects
);

// Review a project (mentors only)
router.put('/:projectId/review',
  authenticateToken,
  isMentor,
  reviewProject
);

// Get student's projects
router.get('/student',
  authenticateToken,
  getStudentProjects
);

module.exports = router; 