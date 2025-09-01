# LocalSpots 🗺️

> **A comprehensive learning project for mastering AdonisJS framework**

LocalSpots is a full-stack web application designed to help developers learn and master the AdonisJS framework through building a real-world location-based service application.

## 🎯 Project Overview

LocalSpots is a location discovery platform that allows users to:
- **Discover** interesting places around them
- **Add** new spots with photos and descriptions
- **Rate and review** locations they've visited
- **Search and filter** spots by category and distance

Built with modern web technologies, this project serves as a comprehensive learning resource for AdonisJS development.

## 🚀 Tech Stack

### Backend
- **[AdonisJS 6](https://adonisjs.com/)** - Full-stack Node.js framework
- **[Lucid ORM](https://docs.adonisjs.com/guides/models/introduction)** - Database ORM with PostgreSQL
- **[VineJS](https://vinejs.dev/)** - Schema validation
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Database
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Migrations & Seeders** - Database schema management

### Authentication
- **AdonisJS Auth** - Built-in authentication system
- **OAuth Support** - Google authentication ready
- **JWT Tokens** - Secure API access

### Frontend (Future)
- **React Native** - Mobile application
- **Google Maps API** - Location services
- **Responsive Design** - Cross-platform compatibility

## 📚 Learning Objectives

This project is designed to teach you:

### 1. **AdonisJS Fundamentals**
- Project structure and architecture
- Controllers, models, and middleware
- Database relationships and migrations
- Authentication and authorization

### 2. **Real-World Development**
- API design and RESTful endpoints
- File uploads and media management
- Geolocation and mapping integration
- Search and filtering algorithms

### 3. **Best Practices**
- Clean architecture principles
- TypeScript integration
- Error handling and validation
- Testing strategies
- Performance optimization

## 🏗️ Project Structure

```
local-spots/
├── app/
│   ├── controllers/     # API endpoints
│   ├── models/         # Database models
│   ├── middleware/     # Request processing
│   ├── services/       # Business logic
│   └── validators/     # Input validation
├── database/
│   ├── migrations/     # Database schema
│   └── seeders/        # Sample data
├── config/             # Configuration files
├── start/              # Application startup
├── tests/              # Test suites
└── docs/               # Documentation
```

## 🗄️ Database Models

### Core Entities
- **User** - Authentication and user management
- **Spot** - Location information with geolocation
- **Category** - Spot classification system
- **Review** - User ratings and comments
- **SpotPhoto** - Image management for locations

### Key Features
- **Geospatial Queries** - Location-based search
- **Relationship Management** - Complex data associations
- **Data Validation** - Input sanitization and verification
- **Performance Optimization** - Strategic indexing and caching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/local-spots.git
   cd local-spots
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Database setup**
   ```bash
   node ace migration:run
   node ace db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Database Setup

```bash
# Create PostgreSQL database
createdb local_spots_dev

# Run migrations
node ace migration:run

# Seed with sample data
node ace db:seed
```

## 📖 Learning Path

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and AdonisJS basics
- [x] Database models and relationships
- [x] Authentication system
- [x] Basic CRUD operations

### Phase 2: Core Features (Week 3-6)
- [ ] Location-based services
- [ ] File upload management
- [ ] Search and filtering
- [ ] Review system

### Phase 3: Advanced Features (Week 7-10)
- [ ] Performance optimization
- [ ] Testing implementation
- [ ] API documentation
- [ ] Deployment strategies

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "User Model"

# Run with coverage
npm run test:coverage
```

## 📚 Documentation

- **[Models Architecture](./docs/MODELS_ARCHITECTURE.md)** - Database design and relationships
- **[API Documentation](./docs/API.md)** - Endpoint specifications
- **[Development Guide](./docs/DEVELOPMENT.md)** - Contributing guidelines

## 🔧 Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
node ace migration:run
node ace migration:rollback
node ace db:seed

# Code quality
npm run lint
npm run format
npm run typecheck
```

## 🌟 Key Learning Features

### 1. **Modern JavaScript/TypeScript**
- ES6+ features and async/await
- Type safety with TypeScript
- Modern Node.js patterns

### 2. **Database Design**
- Relational database modeling
- Migration strategies
- Performance optimization
- Data validation

### 3. **API Development**
- RESTful API design
- Authentication and authorization
- Error handling and validation
- Rate limiting and security

### 4. **Real-World Scenarios**
- File uploads and media management
- Geolocation services
- Search algorithms
- User-generated content

## 🤝 Contributing

This is a learning project, but contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AdonisJS Team** - For the amazing framework
- **Open Source Community** - For inspiration and tools
- **Learning Resources** - For educational content

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/local-spots/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/local-spots/discussions)
- **Documentation**: [AdonisJS Docs](https://docs.adonisjs.com/)

---

**Happy Learning! 🎓**

Built with ❤️ and AdonisJS
