const Dashboard = require('../models/Dashboard');

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const stats = await Dashboard.getStudentStats(studentId);

    res.status(200).json({
      success: true,
      data: {
        courses: {
          total: parseInt(stats.courses.total_courses),
          completed: parseInt(stats.courses.completed_courses),
          active: parseInt(stats.courses.active_courses),
          progressPercentage: stats.courses.total_courses > 0
            ? Math.round((stats.courses.completed_courses / stats.courses.total_courses) * 100)
            : 0
        },
        projects: {
          total: parseInt(stats.projects.total_projects),
          completed: parseInt(stats.projects.completed_projects),
          pending: parseInt(stats.projects.pending_projects),
          progressPercentage: stats.projects.total_projects > 0
            ? Math.round((stats.projects.completed_projects / stats.projects.total_projects) * 100)
            : 0
        },
        mentor: stats.mentor ? {
          id: stats.mentor.id,
          name: stats.mentor.name,
          email: stats.mentor.email,
          totalReviewedProjects: parseInt(stats.mentor.total_reviewed_projects)
        } : null,
        savedCourses: stats.savedCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          price: parseFloat(course.price)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching student dashboard data'
    });
  }
};

const getMentorDashboard = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const stats = await Dashboard.getMentorStats(mentorId);

    res.status(200).json({
      success: true,
      data: {
        mentees: {
          total: parseInt(stats.mentees.total_mentees),
          active: parseInt(stats.mentees.active_mentees)
        },
        projects: {
          total: parseInt(stats.projects.total_projects),
          pendingReviews: parseInt(stats.projects.pending_reviews),
          completedReviews: parseInt(stats.projects.completed_reviews),
          reviewCompletionRate: stats.projects.total_projects > 0
            ? Math.round((stats.projects.completed_reviews / stats.projects.total_projects) * 100)
            : 0
        },
        pendingReviews: stats.pendingReviews.map(review => ({
          studentId: review.id,
          studentName: review.name,
          studentEmail: review.email,
          projectId: review.project_id,
          projectTitle: review.project_title,
          submittedAt: review.submitted_at
        })),
        menteeList: stats.menteeList.map(mentee => ({
          id: mentee.id,
          name: mentee.name,
          email: mentee.email,
          enrolledCourses: parseInt(mentee.enrolled_courses),
          completedProjects: parseInt(mentee.completed_projects)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching mentor dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching mentor dashboard data'
    });
  }
};

module.exports = {
  getStudentDashboard,
  getMentorDashboard
}; 