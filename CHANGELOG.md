# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2024-03-XX

### Added

#### Frontend Setup
- Initialized Next.js frontend with TypeScript
- Added Tailwind CSS for styling
- Implemented responsive layout with navigation
- Created core pages:
  - Registration page with role selection
  - Dashboard with course overview
  - Course listing with filtering and pagination
- Added API client utility for backend communication
- Implemented authentication flow
- Added toast notifications for feedback

## [0.3.0] - 2024-03-XX

### Added

#### Role Management System
- Enhanced User model with role validation and management
- Added role-specific user queries and counts
- Implemented role update functionality
- Added user role endpoints:
  - GET /api/users/me - Get current user details
  - PUT /api/users/:userId/role - Update user role (admin only)
  - GET /api/users/role/:role - List users by role (admin only)

#### Enhanced Authorization
- Added role validation in User model
- Implemented role-based route protection
- Added admin-only routes
- Enhanced error handling for role-related operations

## [0.2.0] - 2024-03-XX

### Added

#### Course Management
- Implemented course listing endpoint (GET /courses)
- Added course creation for mentors (POST /courses)
- Added course detail view endpoint (GET /courses/:id)
- Implemented course enrollment system (POST /courses/:id/enroll)

#### Authentication & Authorization
- Added middleware for token authentication
- Implemented role-based access control (mentor, student, admin)
- Added protection for mentor-only routes

#### Enrollment System
- Created enrollment model with status tracking
- Added enrollment creation and management
- Implemented course completion tracking
- Added student course progress tracking

## [0.1.0] - 2024-03-XX

### Added

#### Project Structure
- Initialized project with basic directory structure
- Created main README.md with project overview and setup instructions
- Added .gitignore file with comprehensive ignore patterns

#### Backend Setup
- Created Express.js server setup in `backend/src/index.js`
- Implemented JWT-based authentication system
- Added core middleware setup (CORS, JSON parsing)
- Created backend README.md with setup instructions

#### Database
- Created PostgreSQL schema with tables for:
  - Users (with role-based access)
  - Courses
  - Enrollments
  - Reviews
- Added database triggers for automatic timestamp updates
- Implemented database connection utility

#### Models
- Created User model with:
  - User registration
  - Email-based user lookup
  - ID-based user lookup
- Created Course model with:
  - Course creation
  - Course lookup by ID
  - Course filtering by category
  - Mentor's courses lookup

#### Authentication
- Implemented user registration endpoint
- Implemented user login endpoint
- Added JWT token generation
- Added password hashing with bcrypt

#### Configuration
- Added package.json with all necessary dependencies:
  - express
  - bcryptjs
  - cors
  - dotenv
  - jsonwebtoken
  - pg (PostgreSQL client)
  - zod (validation)
- Added development dependencies:
  - jest
  - nodemon
- Created example environment configuration template

### Technical Details
- Set up Node.js backend with Express.js framework
- Implemented RESTful API architecture
- Added PostgreSQL database integration
- Set up development environment with hot-reloading
- Added error handling middleware
- Implemented database connection pooling 