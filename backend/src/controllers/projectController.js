const Project = require('../models/Project');

const submitProject = async (req, res) => {
  try {
    const { title, description, githubUrl } = req.body;
    const studentId = req.user.id;
    let submissionFilePath = null;

    // Handle file upload if present
    if (req.file) {
      submissionFilePath = req.file.path;
    }

    const project = await Project.submit({
      studentId,
      title,
      description,
      githubUrl,
      submissionFilePath
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting project'
    });
  }
};

const getPendingProjects = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { limit, offset } = req.query;

    const projects = await Project.getPendingByMentor(mentorId, {
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching pending projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pending projects'
    });
  }
};

const reviewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { feedback, status } = req.body;

    // Verify the project belongs to the mentor
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.mentor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this project'
      });
    }

    const updatedProject = await Project.review({
      projectId,
      feedback,
      status
    });

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Error reviewing project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reviewing project'
    });
  }
};

const getStudentProjects = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { limit, offset } = req.query;

    const projects = await Project.getByStudent(studentId, {
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching student projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching student projects'
    });
  }
};

module.exports = {
  submitProject,
  getPendingProjects,
  reviewProject,
  getStudentProjects
}; 