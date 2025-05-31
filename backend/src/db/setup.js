const { pool } = require('./db');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  try {
    // Read schema file
    const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('Database schema created successfully!');

    // Run seed file
    const { seed } = require('./seed');
    await seed();
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 