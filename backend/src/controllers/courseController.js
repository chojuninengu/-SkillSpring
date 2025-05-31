const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getAllCourses = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const courses = await Course.findAll({ 
      category, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const mentorId = req.user.id;

    const course = await Course.create({
      title,
      description,
      mentorId,
      price,
      category
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findByCourseAndStudent(courseId, studentId);
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      courseId,
      studentId,
      status: 'active'
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Error enrolling in course' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  enrollInCourse
}; 