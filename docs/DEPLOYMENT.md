# Deployment Guide

## 🚀 Deployment Guide

This guide covers different deployment options for the Local Spots application.

## 📋 Prerequisites

Before deploying, make sure you have:

- [ ] Node.js 18+ installed on the server
- [ ] PostgreSQL configured and accessible
- [ ] A domain name (optional but recommended)
- [ ] SSL/TLS certificate (for HTTPS)
- [ ] Environment variables configured

## 🔧 Deployment Preparation

### 1. Application Build

```bash
# Install production dependencies
npm ci --production

# Compile TypeScript to JavaScript
npm run build

# Run migrations
node ace migration:run --force
```

### 2. Environment Variables

Create a production `.env` file with:

```env
# Application
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_KEY=your-secure-app-key
SESSION_DRIVER=cookie

# Database
DB_CONNECTION=pg
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=local_spots

# Security
CORS_ENABLED=true
CORS_ORIGIN=https://yourdomain.com
```

## 🌐 Deployment Options

### Option 1: VPS (Ubuntu/Debian)

#### Installing Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt install nginx
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/local-spots`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/local-spots /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

#### Starting with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'local-spots',
    script: './build/bin/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3333

# Start application
CMD ["node", "build/bin/server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=local_spots
    depends_on:
      - postgres
    volumes:
      - uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=local_spots
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
  uploads:
```

Deploy with Docker:

```bash
docker-compose up -d
```

### Option 3: Heroku

#### Procfile

```
web: node build/bin/server.js
release: node build/ace migration:run --force
```

#### Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create local-spots-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configure environment variables
heroku config:set NODE_ENV=production
heroku config:set APP_KEY=your-app-key

# Deploy
git push heroku main
```

### Option 4: Railway/Render

#### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "node build/bin/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔒 Production Security

### 1. HTTPS/SSL

Use Certbot for Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Security Headers

Add in Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring

### 1. Logs with PM2

```bash
pm2 logs local-spots
pm2 monit
```

### 2. Health Check Endpoint

Create a `/health` endpoint:

```typescript
// start/routes.ts
Route.get('/health', async ({ response }) => {
  return response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

### 3. External Monitoring

- **UptimeRobot**: Availability monitoring
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring

## 🔄 CI/CD with GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/local-spots
          git pull origin main
          npm ci --production
          npm run build
          pm2 restart local-spots
```

## 🔄 Automatic Backup

Backup script (`backup.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump -U postgres local_spots > $BACKUP_DIR/db_$DATE.sql

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /app/uploads

# Keep only last 30 backups
find $BACKUP_DIR -type f -mtime +30 -delete
```

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Application compiled (`npm run build`)
- [ ] Tests passed (`npm test`)
- [ ] SSL/HTTPS configured
- [ ] Firewall configured
- [ ] Monitoring in place
- [ ] Automatic backups configured
- [ ] Logs configured
- [ ] Documentation up to date

## 🚨 Rollback

In case of issues:

```bash
# With PM2
pm2 restart local-spots --update-env

# With Docker
docker-compose down
git checkout previous-version
docker-compose up -d

# Restore database
psql -U postgres local_spots < backup.sql
```

## 📚 Resources

- [AdonisJS Deployment](https://docs.adonisjs.com/guides/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
