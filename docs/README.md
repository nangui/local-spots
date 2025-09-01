# Local Spots - Documentation

## 📚 Table of Contents

- [Local Spots - Documentation](#local-spots---documentation)
  - [📚 Table of Contents](#-table-of-contents)
  - [Overview](#overview)
    - [Technologies Used](#technologies-used)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Installation Steps](#installation-steps)
  - [API Reference](#api-reference)
  - [Database](#database)
  - [Deployment](#deployment)
  - [Contribution](#contribution)
  - [Support](#support)

## Overview

**Local Spots** is a web application developed with AdonisJS 6 that allows users to discover and share interesting local places.

### Technologies Used

- **Framework:** AdonisJS 6
- **Database:** PostgreSQL
- **ORM:** Lucid ORM
- **Authentication:** @adonisjs/auth
- **Validation:** VineJS
- **Runtime:** Node.js

## Architecture

The project follows the standard AdonisJS MVC architecture:

```
local-spots/
├── app/
│   ├── controllers/    # HTTP controllers
│   ├── models/         # Lucid models
│   ├── middleware/     # Custom middleware
│   └── exceptions/     # Exception handlers
├── config/             # Configuration files
├── database/
│   └── migrations/     # Database migrations
├── start/              # Startup files
└── tests/              # Unit and functional tests
```

## Installation

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 13.x
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [REPO_URL]
   cd local-spots
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Configure database**
   ```bash
   node ace migration:run
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## API Reference

For more details on API endpoints, see [API.md](./API.md)

## Database

For database schema documentation, see [DATABASE.md](./DATABASE.md)

## Deployment

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Contribution

To contribute to the project, see [CONTRIBUTING.md](./CONTRIBUTING.md)

## Support

For any questions or issues, feel free to open an issue on the repository.
