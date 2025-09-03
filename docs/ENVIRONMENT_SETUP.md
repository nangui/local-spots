# Environment Setup

## Required Environment Variables

Create a `.env` file at the root of the project with the following variables:

### Application
```bash
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
APP_KEY=your-app-key-here
APP_SECRET=your-app-secret-here
```

### PostgreSQL Database
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=localspots
```

### PostGIS
```bash
POSTGIS_ENABLED=true
```

### JWT Authentication
```bash
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### File Storage
```bash
FILESYSTEM_DISK=local
STORAGE_PATH=storage/app
```

### Email Configuration
```bash
# For development with Mailhog
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=
MAIL_FROM_ADDRESS=noreply@localspots.com
MAIL_FROM_NAME=LocalSpots

# For production with SMTP service
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
# MAIL_ENCRYPTION=tls
```

### CORS
```bash
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-Requested-With
```

### Logging
```bash
LOGGER_LEVEL=info
LOGGER_TRANSPORT=console
```

### Swagger
```bash
SWAGGER_TITLE=LocalSpots API
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=API for LocalSpots application
```

## PostGIS Installation

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis postgresql-13-postgis-3
```

### macOS with Homebrew
```bash
brew install postgresql postgis
```

### Windows
Download and install PostgreSQL with PostGIS extension from the official website.

## Activating PostGIS Extension

After installation, connect to your database and activate the extension:

```sql
-- Connect to database
\c localspots

-- Activate PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify installation
SELECT PostGIS_Version();
```

## Mailhog Installation (Development)

### macOS with Homebrew
```bash
brew install mailhog
brew services start mailhog
```

### Ubuntu/Debian
```bash
# Download Mailhog
wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
sudo mv MailHog_linux_amd64 /usr/local/bin/mailhog
sudo chmod +x /usr/local/bin/mailhog

# Create systemd service
sudo tee /etc/systemd/system/mailhog.service > /dev/null <<EOF
[Unit]
Description=MailHog
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mailhog
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl enable mailhog
sudo systemctl start mailhog
```

### Windows
Download Mailhog from GitHub and run it manually or create a Windows service.

## Accessing Mailhog

Once Mailhog is installed and started, access the web interface:
- **Web Interface**: http://localhost:8025
- **SMTP**: localhost:1025

## Installation Verification

1. **PostgreSQL + PostGIS**:
   ```bash
   psql -h localhost -U postgres -d localspots -c "SELECT PostGIS_Version();"
   ```

2. **Mailhog**:
   ```bash
   curl http://localhost:8025/api/v2/messages
   ```

3. **Application**:
   ```bash
   npm run dev
   # Then visit http://localhost:3333/api/v1
   ```
