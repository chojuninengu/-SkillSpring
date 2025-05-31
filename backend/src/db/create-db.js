const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE skillspring');
    console.log('Database created successfully!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists');
    } else {
      console.error('Error creating database:', error);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

createDatabase(); 