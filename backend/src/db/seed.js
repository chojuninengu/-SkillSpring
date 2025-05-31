const { pool } = require('./db');

async function seed() {
  try {
    // Create sample courses
    const sampleCourses = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        price: 49.99,
        category: 'programming',
        mentor_name: 'John Doe'
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Master the principles of user interface and experience design',
        price: 59.99,
        category: 'design',
        mentor_name: 'Jane Smith'
      },
      {
        title: 'Digital Marketing Essentials',
        description: 'Learn modern digital marketing strategies and tools',
        price: 39.99,
        category: 'marketing',
        mentor_name: 'Mike Johnson'
      }
    ];

    // Insert courses
    for (const course of sampleCourses) {
      await pool.query(
        `INSERT INTO courses (title, description, price, category, mentor_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [course.title, course.description, course.price, course.category, course.mentor_name]
      );
    }

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Export for use in setup.js
module.exports = { seed };

// Run directly if this file is executed directly
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
} 