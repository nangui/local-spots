# Environment Variables for LocalSpots

## Overview

This document describes all the environment variables required to run LocalSpots locally and in production.

## Required Environment Variables

### Application Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | enum | `development` | Environment: `development`, `production`, `test` |
| `PORT` | number | `3333` | Port on which the application will run |
| `APP_KEY` | string | - | Secret key for the application (required) |
| `HOST` | string | `localhost` | Host address for the application |
| `LOG_LEVEL` | enum | `info` | Log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |

### Database Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_HOST` | string | `localhost` | Database host address |
| `DB_PORT` | number | `5432` | Database port |
| `DB_USER` | string | `postgres` | Database username |
| `DB_PASSWORD` | string | - | Database password (optional) |
| `DB_DATABASE` | string | `localspots` | Database name |

### Limiter Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LIMITER_STORE` | enum | `memory` | Rate limiting store: `database`, `memory` |

### Drive Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DRIVE_DISK` | enum | `fs` | File storage driver: `fs` |

### Mail Configuration (Optional)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAIL_HOST` | string | `localhost` | SMTP server host |
| `MAIL_PORT` | number | `1025` | SMTP server port |
| `MAIL_USERNAME` | string | - | SMTP username (optional) |
| `MAIL_PASSWORD` | string | - | SMTP password (optional) |
| `MAIL_FROM_ADDRESS` | string | `noreply@localspots.com` | Default sender email |
| `MAIL_FROM_NAME` | string | `LocalSpots` | Default sender name |

## Environment File Setup

### 1. Create .env File

Create a `.env` file in your project root with the following content:

```bash
# Application Configuration
NODE_ENV=development
PORT=3333
APP_KEY=your-app-key-here-make-it-long-and-random
HOST=localhost
LOG_LEVEL=info

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=localspots

# Limiter Configuration
LIMITER_STORE=memory

# Drive Configuration
DRIVE_DISK=fs

# Mail Configuration (Optional for development)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@localspots.com
MAIL_FROM_NAME=LocalSpots
```

### 2. Generate APP_KEY

Generate a secure APP_KEY using the following command:

```bash
node ace generate:key
```

Or manually create a long, random string (at least 32 characters).

### 3. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Create database
createdb localspots

# Run migrations
node ace db:migrate

# Run seeders (optional)
node ace db:seed
```

## Development vs Production

### Development Environment

For local development, you can use:

- **Database**: Local PostgreSQL instance
- **Mail**: Mailhog (localhost:1025) for testing emails
- **File Storage**: Local filesystem
- **Rate Limiting**: In-memory store

### Production Environment

For production, you should:

- **Database**: Use production PostgreSQL with proper credentials
- **Mail**: Configure real SMTP server (Gmail, SendGrid, etc.)
- **File Storage**: Consider cloud storage (AWS S3, Google Cloud Storage)
- **Rate Limiting**: Use database store for distributed deployments
- **Security**: Use strong, unique APP_KEY and secure database passwords

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

If you get validation errors for missing environment variables:

```bash
# Check if .env file exists
ls -la .env

# Verify variable names match exactly (case-sensitive)
# Example: MAIL_HOST not SMTP_HOST
```

#### 2. Database Connection Issues

```bash
# Test database connection
psql -h localhost -U postgres -d localspots

# Check if PostgreSQL is running
brew services list | grep postgresql
# or
sudo systemctl status postgresql
```

#### 3. Mail Configuration Issues

```bash
# Test Mailhog connection (development)
telnet localhost 1025

# Check mail configuration
node ace config:mail
```

#### 4. Port Already in Use

```bash
# Check what's using the port
lsof -i :3333

# Kill the process or change PORT in .env
```

### Validation Commands

```bash
# Check environment variables
node ace env:list

# Validate configuration
node ace serve --dev
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong, unique APP_KEY** for each environment
3. **Limit database user permissions** in production
4. **Use environment-specific configurations** for different deployments
5. **Rotate sensitive credentials** regularly

## Example Configurations

### Minimal Development Setup

```bash
NODE_ENV=development
PORT=3333
APP_KEY=dev-key-32-chars-long-random-string
HOST=localhost
LOG_LEVEL=debug
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=localspots
LIMITER_STORE=memory
DRIVE_DISK=fs
```

### Production Setup

```bash
NODE_ENV=production
PORT=8080
APP_KEY=prod-key-64-chars-long-random-string
HOST=your-domain.com
LOG_LEVEL=warn
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USER=localspots_user
DB_PASSWORD=strong-password-here
DB_DATABASE=localspots_prod
LIMITER_STORE=database
DRIVE_DISK=fs
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME=LocalSpots
```
