# SkillSpring Backend

This is the backend server for the SkillSpring platform, built with Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillspring

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Cors Configuration
CORS_ORIGIN=http://localhost:3000
```

3. Set up the database:
- Create a PostgreSQL database named 'skillspring'
- Run the schema.sql file from the database directory

## Development

Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Courses
- GET /api/courses - List all courses
- GET /api/courses/:id - Get course details
- POST /api/courses - Create a new course (mentor only)
- PUT /api/courses/:id - Update course (mentor only)

### Mentors
- GET /api/mentors - List all mentors
- GET /api/mentors/:id - Get mentor details
- GET /api/mentors/:id/courses - Get mentor's courses 