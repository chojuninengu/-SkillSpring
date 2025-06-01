const fs = require('fs');
const path = require('path');
const db = require('./database');

async function setupDatabase() {
  try {
    // Read schema file
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    // Execute schema
    await db.query(schema);
    console.log('Database schema created successfully');

    // Run seed script
    require('./seed');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 