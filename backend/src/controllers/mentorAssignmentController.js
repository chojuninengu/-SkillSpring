const MentorAssignment = require('../models/MentorAssignment');

const assignMentorToStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Find available mentor using load balancing
    const availableMentor = await MentorAssignment.findAvailableMentor();
    
    if (!availableMentor) {
      return res.status(503).json({
        success: false,
        message: 'No mentors available at the moment'
      });
    }

    // Assign the mentor to the student
    const assignment = await MentorAssignment.assignMentorToStudent(
      studentId,
      availableMentor.id
    );

    res.status(200).json({
      success: true,
      data: {
        mentor: {
          id: assignment.id,
          name: assignment.name,
          email: assignment.email,
          currentStudents: assignment.current_students,
          maxStudents: assignment.max_students
        }
      }
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error assigning mentor to student'
    });
  }
};

const getMentorStats = async (req, res) => {
  try {
    const mentorId = req.params.mentorId;
    const stats = await MentorAssignment.getMentorStats(mentorId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: stats.id,
        name: stats.name,
        email: stats.email,
        currentStudents: stats.current_students,
        maxStudents: stats.max_students,
        totalStudents: stats.total_students,
        totalProjects: stats.total_projects,
        pendingProjects: stats.pending_projects
      }
    });
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching mentor statistics'
    });
  }
};

const initializeMentorCapacity = async (req, res) => {
  try {
    const mentorId = req.params.mentorId;
    const { maxStudents } = req.body;

    const capacity = await MentorAssignment.initializeMentorCapacity(
      mentorId,
      maxStudents
    );

    res.status(200).json({
      success: true,
      data: {
        mentorId: capacity.mentor_id,
        maxStudents: capacity.max_students,
        currentStudents: capacity.current_students
      }
    });
  } catch (error) {
    console.error('Error initializing mentor capacity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error initializing mentor capacity'
    });
  }
};

module.exports = {
  assignMentorToStudent,
  getMentorStats,
  initializeMentorCapacity
}; 