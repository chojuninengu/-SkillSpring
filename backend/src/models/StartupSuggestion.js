const db = require('../utils/db');

// Static mapping of course categories to startup ideas
const STARTUP_IDEAS_MAP = {
  programming: [
    {
      title: 'Custom Web Development Agency',
      description: 'Start a boutique web development agency focusing on specific industries or technologies.',
      requiredSkills: ['Web Development', 'Project Management', 'Client Communication'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'SaaS Product Development',
      description: 'Create software-as-a-service solutions for business problems you've identified.',
      requiredSkills: ['Full-stack Development', 'Product Design', 'Business Analysis'],
      potentialRevenue: 'Very High',
      initialInvestment: 'Medium',
      marketDemand: 'High',
      challengeLevel: 'High'
    },
    {
      title: 'Mobile App Development Studio',
      description: 'Focus on creating mobile applications for businesses or consumers.',
      requiredSkills: ['Mobile Development', 'UX Design', 'App Store Optimization'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    }
  ],
  design: [
    {
      title: 'UI/UX Design Consultancy',
      description: 'Offer design services to startups and established companies.',
      requiredSkills: ['UI Design', 'UX Research', 'Prototyping'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'Digital Brand Agency',
      description: 'Help companies build and maintain their digital brand presence.',
      requiredSkills: ['Brand Design', 'Social Media', 'Marketing'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'Design Resource Platform',
      description: 'Create and sell design resources, templates, and assets.',
      requiredSkills: ['Digital Design', 'Asset Creation', 'E-commerce'],
      potentialRevenue: 'Medium',
      initialInvestment: 'Low',
      marketDemand: 'Medium',
      challengeLevel: 'Low'
    }
  ],
  marketing: [
    {
      title: 'Digital Marketing Agency',
      description: 'Provide comprehensive digital marketing services to businesses.',
      requiredSkills: ['Digital Marketing', 'Analytics', 'Content Strategy'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'Social Media Management Service',
      description: 'Manage social media presence for businesses and influencers.',
      requiredSkills: ['Social Media Marketing', 'Content Creation', 'Community Management'],
      potentialRevenue: 'Medium',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'Marketing Analytics Platform',
      description: 'Build tools to help businesses track and improve their marketing efforts.',
      requiredSkills: ['Data Analytics', 'Marketing', 'Product Development'],
      potentialRevenue: 'Very High',
      initialInvestment: 'High',
      marketDemand: 'High',
      challengeLevel: 'High'
    }
  ],
  business: [
    {
      title: 'Business Consulting Practice',
      description: 'Offer consulting services to startups and small businesses.',
      requiredSkills: ['Business Strategy', 'Financial Analysis', 'Consulting'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'Medium',
      challengeLevel: 'Medium'
    },
    {
      title: 'Online Business Academy',
      description: 'Create and sell online courses for entrepreneurs.',
      requiredSkills: ['Business Education', 'Content Creation', 'E-learning'],
      potentialRevenue: 'High',
      initialInvestment: 'Medium',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    },
    {
      title: 'Business Process Automation Service',
      description: 'Help businesses automate their workflows and processes.',
      requiredSkills: ['Process Analysis', 'Automation Tools', 'Project Management'],
      potentialRevenue: 'High',
      initialInvestment: 'Low',
      marketDemand: 'High',
      challengeLevel: 'Medium'
    }
  ]
};

class StartupSuggestion {
  static async getSuggestionsForCourse(courseId) {
    try {
      // Get course category
      const courseResult = await db.query(
        'SELECT category FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseResult.rows.length === 0) {
        throw new Error('Course not found');
      }

      const category = courseResult.rows[0].category;
      
      // Get ideas for the category
      const ideas = STARTUP_IDEAS_MAP[category] || [];
      
      // Get related courses that might be helpful
      const relatedCoursesResult = await db.query(
        `SELECT id, title, description, price 
         FROM courses 
         WHERE category = $1 
         AND id != $2
         LIMIT 3`,
        [category, courseId]
      );

      return {
        ideas,
        relatedCourses: relatedCoursesResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  static async getSuggestionsForStudent(studentId) {
    try {
      // Get completed courses for the student
      const completedCoursesResult = await db.query(
        `SELECT DISTINCT c.category
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1 
         AND e.status = 'completed'`,
        [studentId]
      );

      const categories = completedCoursesResult.rows.map(row => row.category);
      
      // Collect unique ideas from all completed course categories
      const ideas = new Set();
      categories.forEach(category => {
        if (STARTUP_IDEAS_MAP[category]) {
          STARTUP_IDEAS_MAP[category].forEach(idea => {
            ideas.add(JSON.stringify(idea));
          });
        }
      });

      // Convert back to objects and limit to top 5 suggestions
      const suggestions = Array.from(ideas)
        .map(idea => JSON.parse(idea))
        .slice(0, 5);

      return {
        suggestions,
        completedCategories: categories
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StartupSuggestion; 