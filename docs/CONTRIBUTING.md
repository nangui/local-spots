# Contributing to Local Spots

## 🤝 Contribution Guide

Thank you for your interest in contributing to Local Spots! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## 📜 Code of Conduct

### Our Commitment

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Standards

Examples of behavior that contributes to creating a positive environment:

- ✅ Using welcoming and inclusive language
- ✅ Respecting different viewpoints and experiences
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other community members

## 🚀 How to Contribute

### 1. Fork and clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/nangui/local-spots.git
cd local-spots

# Add the original repo as remote
git remote add upstream https://github.com/nangui/local-spots.git
```

### 2. Create a branch

```bash
# Create a branch for your feature
git checkout -b feature/feature-name

# Or for a fix
git checkout -b fix/fix-description
```

### 3. Environment setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure database
node ace migration:run

# Run tests
npm test
```

## 💻 Development Process

### Branch Structure

- `main` - Stable production branch
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Git Workflow

```bash
# Sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Create your branch
git checkout -b feature/my-feature

# Make your changes
git add .
git commit -m "feat: feature description"

# Push to your fork
git push origin feature/my-feature
```

## 📝 Code Standards

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Check linting
npm run lint

# Format code
npm run format

# Check TypeScript types
npm run typecheck
```

### Naming Conventions

#### Variables and Functions
```typescript
// ✅ Good - camelCase
const userName = 'John'
function calculateTotal() {}

// ❌ Bad
const user_name = 'John'
function CalculateTotal() {}
```

#### Classes and Types
```typescript
// ✅ Good - PascalCase
class UserController {}
interface UserData {}
type SpotCategory = string

// ❌ Bad
class userController {}
interface userData {}
```

#### Constants
```typescript
// ✅ Good - UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.example.com'

// ❌ Bad
const maxRetries = 3
const apiBaseUrl = 'https://api.example.com'
```

### File Structure

```
app/
├── controllers/
│   └── spots_controller.ts    # Controllers in snake_case
├── models/
│   └── spot.ts                # Models in singular
├── validators/
│   └── create_spot.ts         # Descriptive validators
└── services/
    └── geocoding_service.ts   # Services with _service suffix
```

### Comments and Documentation

```typescript
/**
 * Gets spots near a position
 * @param latitude - Position latitude
 * @param longitude - Position longitude
 * @param radius - Search radius in kilometers
 * @returns List of found spots
 */
async function getNearbySpots(
  latitude: number,
  longitude: number,
  radius: number = 10
): Promise<Spot[]> {
  // Geospatial search logic
}
```

## 🧪 Testing

### Writing Tests

All new code must be accompanied by tests:

```typescript
// tests/functional/spots.spec.ts
import { test } from '@japa/runner'

test.group('Spots', () => {
  test('should create a new spot', async ({ client, assert }) => {
    const response = await client
      .post('/api/spots')
      .json({
        name: 'Test Spot',
        latitude: 48.8566,
        longitude: 2.3522
      })

    response.assertStatus(201)
    assert.properties(response.body(), ['id', 'name'])
  })
})
```

### Running Tests

```bash
# All tests
npm test

# Tests with coverage
npm run test:coverage

# Tests in watch mode
npm run test:watch

# Tests for a specific file
node ace test functional/spots
```

### Minimum Coverage

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## 🔄 Pull Requests

### Before Submitting

- [ ] Code follows project standards
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is up to date
- [ ] Commits follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Existing tests pass
- [ ] New tests have been added

## Checklist
- [ ] My code follows project guidelines
- [ ] I have self-reviewed my code
- [ ] I have commented complex parts
- [ ] I have updated documentation
```

### Review Process

1. Submit your PR to the `develop` branch
2. Wait for review from at least one maintainer
3. Address review comments
4. Once approved, the PR will be merged

## 🐛 Issues

### Reporting a Bug

Use the following template:

```markdown
**Bug Description**
Clear and concise description

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. Ubuntu 20.04]
- Node version: [e.g. 18.12.0]
- Browser: [e.g. Chrome 91]
```

### Proposing a Feature

```markdown
**Problem**
Description of the problem this feature would solve

**Proposed Solution**
Description of the solution

**Alternatives Considered**
Other possible solutions

**Additional Context**
Any additional information
```

## 📊 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code changes)
- `refactor`: Refactoring
- `test`: Adding tests
- `chore`: Maintenance
- `perf`: Performance improvement

### Examples

```bash
# Feature
git commit -m "feat(spots): add geolocation search"

# Fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(api): update endpoint documentation"

# Breaking change
git commit -m "feat(api)!: change response format

BREAKING CHANGE: The API response format has changed from array to object"
```

## 🔧 Useful Scripts

```bash
# Development
npm run dev          # Server with hot reload

# Quality checks
npm run lint         # Check linting
npm run format       # Format code
npm run typecheck    # Check types

# Tests
npm test            # Run tests
npm run test:coverage # Tests with coverage

# Build
npm run build       # Compile for production

# Database
node ace migration:run     # Run migrations
node ace migration:rollback # Rollback last migration
node ace db:seed          # Populate database
```

## 📚 Resources

- [AdonisJS Documentation](https://docs.adonisjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🙏 Acknowledgments

Thank you to all contributors who help improve Local Spots!

## 📧 Contact

For questions about contributing:
- Open an issue on GitHub
- Join our Discord [link]
- Send an email to [email]

---

**Note:** This guide is a living document and may be updated. Check regularly for changes.
