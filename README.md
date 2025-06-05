  # SkillSpring Platform

SkillSpring is a modern mentorship and learning platform that connects skilled mentors with eager learners. The platform facilitates course creation, enrollment, and interactive learning experiences.

## Project Structure

```
skillspring/
├── backend/                    # Node.js backend (Express)
├── frontend/                   # Next.js frontend app
├── database/                   # SQL scripts and schema
└── docs/                       # Project documentation
```

## Features

- User authentication and authorization
- Course creation and management
- Mentor profiles and discovery
- Student enrollment system
- Course reviews and ratings
- Real-time messaging (coming soon)

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API**: RESTful

## Getting Started

1. Set up the backend:
```bash
cd backend
npm install
# Create .env file from .env.example
npm run dev
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Set up the database:
- Create a PostgreSQL database
- Run the schema.sql script from the database directory

## Documentation

See the `docs/` directory for detailed documentation about:
- Project architecture
- API specifications
- Database schema
- Deployment guides

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
