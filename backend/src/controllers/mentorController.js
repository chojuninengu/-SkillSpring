const MentorAssignmentService = require('../services/mentorAssignmentService');

const assignMentor = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const mentorId = await MentorAssignmentService.assignMentorToStudent(studentId);
    
    res.status(200).json({
      success: true,
      data: {
        studentId,
        mentorId,
        message: 'Mentor assigned successfully'
      }
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error assigning mentor'
    });
  }
};

const updateMentorCapacity = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { maxStudents } = req.body;

    const updatedCapacity = await MentorAssignmentService.updateMentorCapacity(
      mentorId,
      maxStudents
    );

    res.status(200).json({
      success: true,
      data: updatedCapacity
    });
  } catch (error) {
    console.error('Error updating mentor capacity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating mentor capacity'
    });
  }
};

const getMentorStats = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const stats = await MentorAssignmentService.getMentorStats(mentorId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Mentor stats not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching mentor stats'
    });
  }
};

module.exports = {
  assignMentor,
  updateMentorCapacity,
  getMentorStats
}; 