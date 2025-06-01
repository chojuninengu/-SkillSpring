const StartupSuggestion = require('../models/StartupSuggestion');

const getSuggestionsForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const suggestions = await StartupSuggestion.getSuggestionsForCourse(courseId);

    res.status(200).json({
      success: true,
      data: {
        ideas: suggestions.ideas.map(idea => ({
          title: idea.title,
          description: idea.description,
          requiredSkills: idea.requiredSkills,
          potentialRevenue: idea.potentialRevenue,
          initialInvestment: idea.initialInvestment,
          marketDemand: idea.marketDemand,
          challengeLevel: idea.challengeLevel
        })),
        relatedCourses: suggestions.relatedCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          price: parseFloat(course.price)
        }))
      }
    });
  } catch (error) {
    console.error('Error getting startup suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching startup suggestions'
    });
  }
};

const getSuggestionsForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const suggestions = await StartupSuggestion.getSuggestionsForStudent(studentId);

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.suggestions.map(idea => ({
          title: idea.title,
          description: idea.description,
          requiredSkills: idea.requiredSkills,
          potentialRevenue: idea.potentialRevenue,
          initialInvestment: idea.initialInvestment,
          marketDemand: idea.marketDemand,
          challengeLevel: idea.challengeLevel
        })),
        completedCategories: suggestions.completedCategories
      }
    });
  } catch (error) {
    console.error('Error getting student startup suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching student startup suggestions'
    });
  }
};

module.exports = {
  getSuggestionsForCourse,
  getSuggestionsForStudent
}; 