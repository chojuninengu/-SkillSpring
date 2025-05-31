const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedDatabase() {
  try {
    // Create a mentor user
    const hashedPassword = await bcrypt.hash('mentor123', 10);
    const mentorResult = await db.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['John Doe', 'mentor@example.com', hashedPassword, 'mentor']
    );
    const mentorId = mentorResult.rows[0].id;

    // Sample courses
    const courses = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
        price: 49.99,
        category: 'programming',
        mentor_id: mentorId
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Master the principles of user interface and user experience design.',
        price: 59.99,
        category: 'design',
        mentor_id: mentorId
      },
      {
        title: 'Digital Marketing Essentials',
        description: 'Learn effective strategies for online marketing and brand promotion.',
        price: 39.99,
        category: 'marketing',
        mentor_id: mentorId
      },
      {
        title: 'Business Analytics',
        description: 'Learn to make data-driven business decisions using analytics tools.',
        price: 69.99,
        category: 'business',
        mentor_id: mentorId
      },
      {
        title: 'Advanced JavaScript Development',
        description: 'Deep dive into modern JavaScript features and frameworks.',
        price: 79.99,
        category: 'programming',
        mentor_id: mentorId
      },
      {
        title: 'Graphic Design for Beginners',
        description: 'Learn the fundamentals of graphic design using industry-standard tools.',
        price: 49.99,
        category: 'design',
        mentor_id: mentorId
      }
    ];

    // Insert courses
    for (const course of courses) {
      await db.query(
        `INSERT INTO courses (title, description, price, category, mentor_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [course.title, course.description, course.price, course.category, course.mentor_id]
      );
    }

    console.log('Database seeded successfully!');
    console.log('Mentor credentials:');
    console.log('Email: mentor@example.com');
    console.log('Password: mentor123');

    // Close the database connection
    await db.pool.end();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase(); 