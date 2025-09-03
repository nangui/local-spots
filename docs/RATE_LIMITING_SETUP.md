# Rate Limiting Setup

## Overview

Rate limiting is implemented in LocalSpots to protect the API against abuse, brute force attacks, and DDoS attempts. The system uses `@adonisjs/limiter` package with configurable storage backends.

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Rate Limiting Configuration
LIMITER_STORE=database  # Options: database, redis, memory
LIMITER_REDIS_CONNECTION=local  # Redis connection name (if using Redis)
```

### Storage Options

#### 1. Database Store (Default)
- **Use case**: Development and small to medium applications
- **Pros**: Persistent, no additional services required
- **Cons**: Slower than Redis, database overhead

```bash
LIMITER_STORE=database
```

#### 2. Redis Store (Recommended for Production)
- **Use case**: Production environments, high-traffic applications
- **Pros**: Fast, scalable, built-in expiration
- **Cons**: Requires Redis service

```bash
LIMITER_STORE=redis
LIMITER_REDIS_CONNECTION=local
```

#### 3. Memory Store
- **Use case**: Testing and development only
- **Pros**: Fastest, no external dependencies
- **Cons**: Not persistent, resets on restart

```bash
LIMITER_STORE=memory
```

## Rate Limiting Rules

### Authentication Endpoints
- **Register/Login**: 5 requests per minute
- **Refresh Token**: 10 requests per minute
- **Logout**: 10 requests per minute

**Rationale**: Prevents brute force attacks on authentication

### Protected API Endpoints
- **Profile Management**: 30-60 requests per minute
- **Spots CRUD**: 20-100 requests per minute
- **Reviews CRUD**: 20-60 requests per minute
- **Categories**: 100 requests per minute

**Rationale**: Balances usability with abuse prevention

### File Upload Endpoints
- **Photo Upload**: 10 uploads per hour
- **Photo Deletion**: 30 deletions per minute

**Rationale**: Prevents storage abuse and bandwidth consumption

### Public Endpoints
- **Public Spots**: 30-100 requests per minute
- **Public Categories**: 100 requests per minute

**Rationale**: Allows public access while preventing scraping

## Implementation Details

### Middleware Configuration

The rate limiting is applied using the `throttle` middleware with the following syntax:

```typescript
router.post('/auth/login', [AuthController, 'login'])
  .use('throttle:5,1m')  // 5 requests per minute
```

### Rate Limit Parameters

- **Format**: `throttle:requests,timeframe`
- **Examples**:
  - `throttle:5,1m` - 5 requests per minute
  - `throttle:10,1h` - 10 requests per hour
  - `throttle:100,1m` - 100 requests per minute

### Time Units

- `s` - seconds
- `m` - minutes
- `h` - hours
- `d` - days

## Database Schema

The rate limiting system creates a `rate_limits` table with the following structure:

```sql
CREATE TABLE rate_limits (
  key VARCHAR(255) NOT NULL PRIMARY KEY,
  points INTEGER(9) NOT NULL DEFAULT 0,
  expire BIGINT UNSIGNED
);
```

## Monitoring and Debugging

### Rate Limit Headers

When rate limiting is active, the API returns these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

When a rate limit is exceeded, the API returns:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

## Customization

### Adjusting Rate Limits

To modify rate limits, update the routes in `start/routes.ts`:

```typescript
// Example: Increase login attempts to 10 per minute
router.post('/auth/login', [AuthController, 'login'])
  .use('throttle:10,1m')

// Example: Allow more photo uploads
router.post('/spots/:spotId/photos', [SpotPhotosController, 'store'])
  .use('auth')
  .use('throttle:20,1h')  // 20 uploads per hour
```

### Adding New Rate Limit Rules

1. **Define the rule** in `start/limiter.ts`:
   ```typescript
   export const customThrottle = limiter.define('custom', () => {
     return limiter.allowRequests(50).every('5 minutes')
   })
   ```

2. **Register the middleware** in `start/kernel.ts`:
   ```typescript
   export const middleware = router.named({
     // ... existing middlewares
     customThrottle: () => import('#start/limiter').then(m => m.customThrottle),
   })
   ```

3. **Apply to routes**:
   ```typescript
   router.get('/custom-endpoint', [Controller, 'method'])
     .use('customThrottle')
   ```

## Best Practices

### 1. Start Conservative
- Begin with stricter limits and relax them based on usage patterns
- Monitor API usage to find the right balance

### 2. Differentiate by User Type
- Apply stricter limits to unauthenticated users
- Allow higher limits for authenticated users
- Consider premium user tiers with higher limits

### 3. Monitor and Adjust
- Track rate limit violations
- Adjust limits based on legitimate usage patterns
- Consider business hours and peak usage times

### 4. User Communication
- Provide clear error messages when limits are exceeded
- Include retry-after information
- Consider implementing a status endpoint for current limits

## Troubleshooting

### Common Issues

1. **Rate limits too strict**:
   - Increase the request count or timeframe
   - Monitor legitimate user behavior

2. **Rate limits too loose**:
   - Decrease the request count
   - Add additional security measures

3. **Performance issues**:
   - Switch to Redis storage
   - Optimize database queries
   - Consider caching strategies

### Debug Mode

Enable debug logging by setting:

```bash
LOGGER_LEVEL=debug
```

This will show rate limiting decisions in the logs.

## Security Considerations

### 1. IP-based Limiting
The current implementation uses IP addresses for rate limiting. Consider:
- User ID-based limiting for authenticated requests
- Combined IP + User ID limiting
- Geolocation-based limiting

### 2. Burst Handling
- Implement burst allowances for legitimate use cases
- Consider sliding window vs. fixed window algorithms
- Add exponential backoff for repeated violations

### 3. Whitelisting
- Consider whitelisting certain IPs or user agents
- Implement admin override capabilities
- Add emergency bypass mechanisms

## Future Enhancements

### 1. Dynamic Rate Limiting
- Adjust limits based on user behavior
- Implement machine learning for anomaly detection
- Add adaptive rate limiting

### 2. Advanced Analytics
- Track rate limit violations
- Generate abuse reports
- Implement predictive blocking

### 3. Integration with Security Tools
- Connect with WAF (Web Application Firewall)
- Integrate with SIEM systems
- Add threat intelligence feeds
