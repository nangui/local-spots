# Health Checks System

## Overview

LocalSpots implements a comprehensive health check system to monitor the application's health in production. This system provides real-time insights into the application's status, database connectivity, file storage, and system resources.

## Features

### 🔍 Comprehensive Monitoring
- **System Health**: Disk space, memory usage, CPU monitoring
- **Database Health**: Connection status, PostGIS functionality, connection count
- **Application Health**: Environment configuration, required variables
- **File Storage Health**: Disk availability, permissions, storage space

### 🚀 Multiple Endpoints
- **`/health`**: Complete health check report
- **`/health/ping`**: Lightweight ping for load balancers
- **`/health/detailed`**: Categorized health check with summary

### 🛡️ Security Features
- **Optional Protection**: Configurable secret-based access control
- **Rate Limiting**: Integrated with the application's rate limiting system
- **Access Control**: Headers-based authentication for monitoring services

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Health Check Configuration (Optional)
HEALTH_CHECK_SECRET=your_monitoring_secret_here  # Protect health check endpoints
```

### Health Check Settings

The health checks are configured in `start/health.ts` with the following thresholds:

#### System Health Checks
- **Disk Space**: Warning at 80%, Failure at 90%
- **Memory Heap**: Warning at 300MB, Failure at 700MB
- **Memory RSS**: Warning at 600MB, Failure at 800MB

#### Database Health Checks
- **Connection**: Cached for 30 seconds
- **Connection Count**: Warning at 8, Failure at 12

#### Custom Health Checks
- **LocalSpots**: Cached for 1 minute
- **File Storage**: Cached for 2 minutes
- **PostGIS**: Cached for 1 minute

## Available Endpoints

### 1. Basic Health Check

```http
GET /health
```

**Response (Healthy):**
```json
{
  "isHealthy": true,
  "status": "ok",
  "finishedAt": "2024-01-15T10:30:00.000Z",
  "checks": [
    {
      "name": "Disk space check",
      "isCached": false,
      "message": "Disk usage is 45%, which is under the defined thresholds",
      "status": "ok",
      "finishedAt": "2024-01-15T10:30:00.000Z",
      "meta": {
        "sizeInPercentage": {
          "used": 45,
          "failureThreshold": 90,
          "warningThreshold": 80
        }
      }
    }
  ],
  "application": {
    "name": "LocalSpots API",
    "version": "v1.0.0",
    "environment": "development",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600.5,
    "memory": {
      "rss": 52428800,
      "heapTotal": 20971520,
      "heapUsed": 10485760,
      "external": 1024000
    },
    "pid": 12345,
    "platform": "darwin",
    "nodeVersion": "v18.17.0"
  }
}
```

**Response (Unhealthy):**
```json
{
  "isHealthy": false,
  "status": "error",
  "finishedAt": "2024-01-15T10:30:00.000Z",
  "checks": [
    {
      "name": "Database health check (postgres)",
      "isCached": false,
      "message": "Failed to connect to the database server",
      "status": "error",
      "finishedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "application": { ... }
}
```

### 2. Ping Endpoint

```http
GET /health/ping
```

**Response:**
```json
{
  "status": "ok",
  "message": "pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Detailed Health Check

```http
GET /health/detailed
```

**Response:**
```json
{
  "isHealthy": true,
  "status": "ok",
  "finishedAt": "2024-01-15T10:30:00.000Z",
  "checks": [ ... ],
  "categorizedChecks": {
    "system": [
      {
        "name": "Disk space check",
        "status": "ok",
        "message": "Disk usage is 45%"
      }
    ],
    "database": [
      {
        "name": "Database health check (postgres)",
        "status": "ok",
        "message": "Successfully connected to the database server"
      }
    ],
    "application": [
      {
        "name": "LocalSpots Health Check",
        "status": "ok",
        "message": "LocalSpots application configuration is healthy"
      }
    ]
  },
  "summary": {
    "totalChecks": 8,
    "passedChecks": 8,
    "warningChecks": 0,
    "failedChecks": 0
  },
  "application": { ... }
}
```

## Health Check Types

### 1. System Health Checks

#### DiskSpaceCheck
- **Purpose**: Monitor disk space usage
- **Thresholds**: Warning at 80%, Failure at 90%
- **Cache**: No caching (real-time)
- **Use Case**: Prevent disk space exhaustion

#### MemoryHeapCheck
- **Purpose**: Monitor Node.js heap memory usage
- **Thresholds**: Warning at 300MB, Failure at 700MB
- **Cache**: No caching (real-time)
- **Use Case**: Detect memory leaks

#### MemoryRSSCheck
- **Purpose**: Monitor Resident Set Size
- **Thresholds**: Warning at 600MB, Failure at 800MB
- **Cache**: No caching (real-time)
- **Use Case**: Monitor overall memory consumption

### 2. Database Health Checks

#### DbCheck
- **Purpose**: Verify database connectivity
- **Cache**: 30 seconds
- **Use Case**: Ensure database is accessible

#### DbConnectionCountCheck
- **Purpose**: Monitor active database connections
- **Thresholds**: Warning at 8, Failure at 12
- **Cache**: 30 seconds
- **Use Case**: Prevent connection pool exhaustion

### 3. Custom Health Checks

#### LocalSpotsHealthCheck
- **Purpose**: Verify application configuration
- **Checks**: Environment variables, APP_KEY length
- **Cache**: 1 minute
- **Use Case**: Ensure proper application setup

#### FileStorageHealthCheck
- **Purpose**: Monitor file storage system
- **Checks**: Disk availability, permissions, storage space
- **Cache**: 2 minutes
- **Use Case**: Ensure file uploads work properly

#### PostGISHealthCheck
- **Purpose**: Verify PostGIS functionality
- **Checks**: Extension availability, spatial functions
- **Cache**: 1 minute
- **Use Case**: Ensure geospatial features work

## Security and Access Control

### Optional Secret Protection

To protect health check endpoints, set the `HEALTH_CHECK_SECRET` environment variable:

```bash
HEALTH_CHECK_SECRET=your_super_secret_monitoring_key
```

Then include the secret in your monitoring requests:

```http
GET /health
X-Monitoring-Secret: your_super_secret_monitoring_key
```

### Rate Limiting

Health check endpoints are subject to the same rate limiting as other public endpoints:

- **`/health`**: 30 requests per minute
- **`/health/ping`**: 30 requests per minute
- **`/health/detailed`**: 30 requests per minute

## Monitoring Integration

### Load Balancer Health Checks

Use the `/health/ping` endpoint for load balancer health checks:

```bash
# Nginx upstream health check
upstream localspots {
    server 127.0.0.1:3333 max_fails=3 fail_timeout=30s;
}

# Health check location
location /health/ping {
    proxy_pass http://localspots;
    access_log off;
}
```

### External Monitoring Services

#### Prometheus
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'localspots'
    static_configs:
      - targets: ['localhost:3333']
    metrics_path: '/health'
    scrape_interval: 30s
```

#### Grafana
```json
// Dashboard query
{
  "targets": [
    {
      "expr": "localspots_health_status",
      "legendFormat": "Health Status"
    }
  ]
}
```

#### Uptime Monitoring
```bash
# Simple uptime check with curl
curl -f http://localhost:3333/health/ping || echo "Service down"
```

## Customization

### Adding New Health Checks

1. **Create the health check class**:

```typescript
// app/health_checks/custom_health_check.ts
import { Result, BaseCheck } from '@adonisjs/core/health'

export class CustomHealthCheck extends BaseCheck {
  name = 'Custom Health Check'

  async run() {
    try {
      // Your custom health check logic
      const isHealthy = await this.performCheck()
      
      if (isHealthy) {
        return Result.ok('Custom check passed')
      }
      
      return Result.failed('Custom check failed')
    } catch (error) {
      return Result.failed('Custom check error')
    }
  }

  private async performCheck(): Promise<boolean> {
    // Implementation
    return true
  }
}
```

2. **Register in start/health.ts**:

```typescript
import { CustomHealthCheck } from '#health_checks/custom_health_check'

export const healthChecks = new HealthChecks().register([
  // ... existing checks
  new CustomHealthCheck()
    .cacheFor('5 minutes')
])
```

### Modifying Thresholds

```typescript
// Customize thresholds
new DiskSpaceCheck()
  .warnWhenExceeds(70)  // Warning at 70%
  .failWhenExceeds(85)  // Failure at 85%

new MemoryHeapCheck()
  .warnWhenExceeds('200 mb')  // Warning at 200MB
  .failWhenExceeds('500 mb')  // Failure at 500MB
```

### Caching Strategies

```typescript
// Different caching strategies
new DbCheck(db.connection())
  .cacheFor('30 seconds')  // Short cache for critical checks

new FileStorageHealthCheck()
  .cacheFor('2 minutes')   // Longer cache for stable checks

new PostGISHealthCheck()
  .cacheFor('1 minute')    // Medium cache for moderate checks
```

## Troubleshooting

### Common Issues

#### 1. Health Check Failures
- **Check logs**: Look for error messages in application logs
- **Verify configuration**: Ensure all required environment variables are set
- **Check dependencies**: Verify database, file system, and other services are running

#### 2. Performance Issues
- **Adjust caching**: Increase cache duration for expensive checks
- **Optimize queries**: Review database health check queries
- **Monitor resources**: Check if health checks are consuming too many resources

#### 3. False Positives
- **Review thresholds**: Adjust warning and failure thresholds
- **Check timing**: Ensure checks run at appropriate intervals
- **Validate logic**: Review custom health check implementations

### Debug Mode

Enable debug logging to see detailed health check information:

```bash
LOGGER_LEVEL=debug
```

### Health Check Logs

Health check results are logged with the following format:

```
[INFO] Health check completed: isHealthy=true, status=ok, checks=8
[WARN] Health check warning: Disk space usage is 82%
[ERROR] Health check failed: Database connection failed
```

## Best Practices

### 1. Threshold Configuration
- **Start conservative**: Begin with higher thresholds and adjust down
- **Monitor trends**: Watch for patterns in health check results
- **Environment-specific**: Use different thresholds for development and production

### 2. Caching Strategy
- **Critical checks**: Minimal caching (30 seconds or less)
- **Stable checks**: Longer caching (1-5 minutes)
- **Resource-intensive**: Cache results to reduce overhead

### 3. Monitoring Integration
- **Multiple endpoints**: Use different endpoints for different monitoring needs
- **Alerting**: Set up alerts for critical health check failures
- **Escalation**: Implement escalation procedures for persistent issues

### 4. Performance Considerations
- **Async operations**: Use async/await for I/O operations
- **Timeout handling**: Implement timeouts for external service checks
- **Resource limits**: Avoid health checks that consume excessive resources

## Future Enhancements

### 1. Advanced Monitoring
- **Metrics collection**: Export health check metrics to monitoring systems
- **Trend analysis**: Historical health check data analysis
- **Predictive alerts**: Machine learning-based failure prediction

### 2. Integration Features
- **Webhook notifications**: Send health check results to external services
- **Slack/Discord integration**: Real-time notifications in chat platforms
- **Email alerts**: Automated email notifications for critical issues

### 3. Health Check Orchestration
- **Dependency management**: Health checks that depend on other checks
- **Conditional execution**: Skip certain checks based on conditions
- **Rolling health checks**: Stagger health check execution to reduce load
