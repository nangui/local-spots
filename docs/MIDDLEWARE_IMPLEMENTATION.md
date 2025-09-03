# Middleware Implementation Guide

## Overview

LocalSpots implements a comprehensive middleware system for authentication, rate limiting, and request processing. This guide explains how middlewares are organized, implemented, and applied to routes.

## Middleware Architecture

### 1. Middleware Organization

The middleware system is organized into three main categories:

#### **Authentication Middlewares**
- **`authMiddleware`** - JWT token verification for protected routes
- **`guestMiddleware`** - Redirect authenticated users from guest-only routes

#### **Rate Limiting Middlewares (Throttling)**
- **`authThrottle`** - Strict rate limiting for authentication endpoints (5 req/min)
- **`userThrottle`** - Moderate rate limiting for user profile routes (60 req/min)
- **`spotsThrottle`** - Moderate rate limiting for spots management (60 req/min)
- **`reviewsThrottle`** - Moderate rate limiting for reviews (60 req/min)
- **`categoriesThrottle`** - High rate limiting for categories (100 req/min)
- **`photosThrottle`** - Strict rate limiting for file uploads (10 req/hour)
- **`publicThrottle`** - Moderate rate limiting for public routes (30 req/min)
- **`healthThrottle`** - Rate limiting for health check endpoints (60 req/min)

#### **System Middlewares**
- **`container_bindings_middleware`** - Dependency injection container
- **`force_json_response_middleware`** - Force JSON responses
- **`cors_middleware`** - Cross-origin resource sharing
- **`bodyparser_middleware`** - Request body parsing
- **`initialize_auth_middleware`** - Authentication system initialization

## Implementation Details

### 1. Middleware Configuration

#### **Kernel Configuration (`start/kernel.ts`)**

```typescript
import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

// Server middleware stack (runs on all HTTP requests)
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

// Router middleware stack (runs on requests with registered routes)
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware')
])

// Named middleware collection
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  guest: () => import('#middleware/guest_middleware'),
})
```

#### **Throttle Middleware Configuration (`start/limiter.ts`)**

```typescript
import limiter from '@adonisjs/limiter/services/main'

// Authentication throttle - 5 requests per minute (prevents brute force)
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(5).every('1 minute')
})

// User profile throttle - 60 requests per minute
export const userThrottle = limiter.define('user', () => {
  return limiter.allowRequests(60).every('1 minute')
})

// Spots management throttle - 60 requests per minute
export const spotsThrottle = limiter.define('spots', () => {
  return limiter.allowRequests(60).every('1 minute')
})

// Photo uploads throttle - 10 requests per hour (prevents abuse)
export const photosThrottle = limiter.define('photos', () => {
  return limiter.allowRequests(10).every('1 hour')
})

// Public routes throttle - 30 requests per minute
export const publicThrottle = limiter.define('public', () => {
  return limiter.allowRequests(30).every('1 minute')
})
```

#### **Custom Middleware Functions (`start/middleware.ts`)**

```typescript
// Import named middlewares
import auth from '#middleware/auth_middleware'
import guest from '#middleware/guest_middleware'

// Export middleware functions for use in routes
export const authMiddleware = auth
export const guestMiddleware = guest

// Note: Rate limiting is now handled by @adonisjs/limiter
// See start/limiter.ts for throttle middleware definitions
```

### 2. Route Middleware Application

#### **Individual Route Middleware**

```typescript
router
  .get('/profile', [UsersController, 'profile'])
  .as('users.profile')
  .use(authMiddleware)        // Apply authentication
  .use(userThrottle)          // Apply rate limiting
```

#### **Group Route Middleware**

```typescript
router
  .group(() => {
    router.get('/', [SpotsController, 'index']).as('spots.index')
    router.post('/', [SpotsController, 'store']).as('spots.store')
    // ... other routes
  })
  .prefix('/spots')
  .as('spots')
  .use(authMiddleware)        // Apply to all routes in group
  .use(spotsThrottle)         // Apply rate limiting to group
```

#### **Nested Group Middleware**

```typescript
router
  .group(() => {
    router
      .group(() => {
        // Inner group routes
      })
      .use(innerMiddleware)   // Apply to inner group only
  })
  .use(outerMiddleware)       // Apply to all routes in outer group
```

## Middleware Types

### 1. Authentication Middleware

#### **Auth Middleware (`app/middleware/auth_middleware.ts`)**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    // Verify JWT token
    if (!ctx.auth.isAuthenticated) {
      return ctx.response.unauthorized({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    await next()
  }
}
```

**Usage:**
```typescript
router.get('/protected', [Controller, 'method'])
  .use('auth')  // Using named middleware
  // OR
  .use(authMiddleware)  // Using imported function
```

#### **Guest Middleware (`app/middleware/guest_middleware.ts`)**

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class GuestMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    // Redirect authenticated users
    if (ctx.auth.isAuthenticated) {
      return ctx.response.redirect('/dashboard')
    }

    await next()
  }
}
```

**Usage:**
```typescript
router.get('/login', [AuthController, 'login'])
  .use('guest')  // Redirect if already authenticated
```

### 2. Rate Limiting Middleware (Throttling)

#### **Native AdonisJS Throttling**

LocalSpots uses the native `@adonisjs/limiter` package for rate limiting, which provides:

- **Database storage** for rate limit data
- **Redis support** for high-performance applications
- **Memory storage** for development and testing
- **Configurable limits** with flexible timeframes
- **IP-based limiting** with user ID support for authenticated requests

#### **Throttle Middleware Examples**

```typescript
// Authentication endpoints - strict limiting
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(5).every('1 minute')
})

// File uploads - strict limiting to prevent abuse
export const photosThrottle = limiter.define('photos', () => {
  return limiter.allowRequests(10).every('1 hour')
})

// Public endpoints - moderate limiting
export const publicThrottle = limiter.define('public', () => {
  return limiter.allowRequests(30).every('1 minute')
})
```

#### **Applying Throttle Middleware**

```typescript
// Apply to individual routes
router.post('/login', [AuthController, 'login'])
  .use(authThrottle)

// Apply to route groups
router
  .group(() => {
    // Photo management routes
  })
  .use(photosThrottle)

// Apply to nested groups
router
  .group(() => {
    router
      .group(() => {
        // Inner routes
      })
      .use(innerThrottle)
  })
  .use(outerThrottle)
```

### 3. Custom Middleware

#### **Logging Middleware**

```typescript
export const loggingMiddleware = (ctx: any, next: any) => {
  const startTime = Date.now()
  
  console.log(`[${new Date().toISOString()}] ${ctx.request.method()} ${ctx.request.url()}`)
  
  return next().finally(() => {
    const duration = Date.now() - startTime
    console.log(`Request completed in ${duration}ms`)
  })
}
```

#### **Validation Middleware**

```typescript
export const validateParams = (ctx: any, next: any) => {
  const { id } = ctx.params
  
  if (!id || isNaN(Number(id))) {
    return ctx.response.badRequest({
      error: 'Invalid parameter',
      message: 'ID must be a valid number'
    })
  }
  
  return next()
}
```

## Middleware Execution Flow

### 1. Request Processing Order

```
HTTP Request
    ↓
Server Middleware Stack
    ↓
Router Middleware Stack
    ↓
Route-Specific Middleware
    ↓
Route Handler
    ↓
Response
```

### 2. Middleware Chain Example

```typescript
router
  .get('/spots/:id', [SpotsController, 'show'])
  .as('spots.show')
  .use(authMiddleware)        // 1. Check authentication
  .use(spotsThrottle)        // 2. Apply rate limiting
  .use(validateParams)       // 3. Validate parameters
  .use(loggingMiddleware)    // 4. Log request
```

**Execution Order:**
1. **Authentication Check** - Verify JWT token
2. **Rate Limiting** - Check request frequency using @adonisjs/limiter
3. **Parameter Validation** - Validate route parameters
4. **Logging** - Log request details
5. **Route Handler** - Execute controller method

## Rate Limiting Strategy

### 1. Rate Limiting Rules

| Route Type | Rate Limit | Purpose |
|------------|------------|---------|
| **Authentication** | 5 requests/minute | Prevent brute force attacks |
| **User Profile** | 60 requests/minute | Normal user activity |
| **Spots Management** | 60 requests/minute | Content creation/editing |
| **Reviews** | 60 requests/minute | User feedback |
| **Categories** | 100 requests/minute | Reference data |
| **Photo Uploads** | 10 requests/hour | Prevent abuse |
| **Public Routes** | 30 requests/minute | Prevent scraping |
| **Health Checks** | 60 requests/minute | Monitoring access |

### 2. Rate Limiting Implementation

#### **Current Implementation (Native AdonisJS)**

```typescript
import limiter from '@adonisjs/limiter/services/main'

export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(5).every('1 minute')
})

export const photosThrottle = limiter.define('photos', () => {
  return limiter.allowRequests(10).every('1 hour')
})
```

#### **Configuration (`config/limiter.ts`)**

```typescript
import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE', 'database'),
  stores: {
    redis: stores.redis({ connectionName: 'local' }),
    database: stores.database({ tableName: 'rate_limits' }),
    memory: stores.memory({})
  },
})

export default limiterConfig
```

## Middleware Testing

### 1. Unit Testing

```typescript
import { test } from '@japa/runner'
import { AuthMiddleware } from '#middleware/auth_middleware'

test.group('Auth Middleware', () => {
  test('should allow authenticated requests', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    const ctx = createMockContext({ isAuthenticated: true })
    
    const result = await middleware.handle(ctx, () => Promise.resolve())
    
    assert.isUndefined(result)
  })
  
  test('should reject unauthenticated requests', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    const ctx = createMockContext({ isAuthenticated: false })
    
    const result = await middleware.handle(ctx, () => Promise.resolve())
    
    assert.equal(result.status, 401)
  })
})
```

### 2. Integration Testing

```typescript
test('protected route should require authentication', async ({ client }) => {
  const response = await client.get('/api/v1/profile')
  
  response.assertStatus(401)
  response.assertBodyContains({
    error: 'Unauthorized',
    message: 'Authentication required'
  })
})

test('rate limiting should work on auth endpoints', async ({ client }) => {
  // Make multiple requests to trigger rate limiting
  for (let i = 0; i < 6; i++) {
    const response = await client.post('/api/v1/auth/login')
    if (i === 5) {
      response.assertStatus(429) // Too Many Requests
    }
  }
})
```

## Best Practices

### 1. Middleware Organization

- **Keep middlewares focused** - Each middleware should have a single responsibility
- **Use descriptive names** - Clear naming for easy understanding
- **Group related middlewares** - Organize by functionality
- **Document middleware behavior** - Clear documentation of what each middleware does

### 2. Performance Considerations

- **Minimize middleware overhead** - Keep middleware functions lightweight
- **Use async/await properly** - Handle asynchronous operations correctly
- **Cache expensive operations** - Cache results when possible
- **Monitor middleware performance** - Track execution time

### 3. Security Considerations

- **Validate inputs early** - Check parameters and body data early in the chain
- **Apply authentication first** - Verify user identity before processing
- **Rate limit sensitive endpoints** - Prevent abuse of authentication and upload endpoints
- **Log security events** - Track failed authentication attempts

### 4. Error Handling

- **Graceful error handling** - Don't let middleware errors crash the application
- **Meaningful error messages** - Provide clear error information
- **Proper HTTP status codes** - Use appropriate status codes for different errors
- **Error logging** - Log errors for debugging and monitoring

## Future Enhancements

### 1. Advanced Rate Limiting

- **User-specific limits** - Different limits for different user types
- **Dynamic rate limiting** - Adjust limits based on user behavior
- **Rate limiting analytics** - Monitor and analyze rate limiting patterns
- **Geographic rate limiting** - Different limits for different regions

### 2. Middleware Composition

- **Middleware factories** - Create middlewares with configurable parameters
- **Conditional middleware** - Apply middlewares based on conditions
- **Middleware pipelines** - Chain multiple middlewares together
- **Middleware testing utilities** - Tools for testing middleware combinations

### 3. Monitoring and Analytics

- **Middleware performance metrics** - Track execution time and resource usage
- **Request flow visualization** - Visual representation of middleware execution
- **Error rate monitoring** - Track middleware error rates
- **Custom dashboards** - Build monitoring dashboards for middleware

## Troubleshooting

### 1. Common Issues

#### **Middleware Not Executing**
- Check middleware registration in `start/kernel.ts`
- Verify middleware import paths
- Ensure middleware is properly applied to routes

#### **Authentication Errors**
- Verify JWT token configuration
- Check middleware execution order
- Validate token format and expiration

#### **Rate Limiting Issues**
- Check rate limiting configuration in `config/limiter.ts`
- Verify storage backend (database/Redis)
- Monitor rate limiting logs
- Check database table `rate_limits` exists

### 2. Debug Mode

Enable debug logging to see middleware execution:

```bash
LOGGER_LEVEL=debug
```

### 3. Middleware Logs

Middleware execution is logged with the following format:

```
[INFO] Middleware executed: auth, duration: 15ms
[WARN] Rate limit exceeded: auth, IP: 192.168.1.1
[ERROR] Middleware error: validation, message: Invalid parameter
```

### 4. Rate Limiting Debug

To debug rate limiting issues:

```bash
# Check rate limits table
node ace db:query "SELECT * FROM rate_limits"

# Clear rate limits (development only)
node ace db:query "DELETE FROM rate_limits"
```

## Conclusion

The middleware system in LocalSpots provides a robust foundation for authentication, rate limiting, and request processing. By using the native `@adonisjs/limiter` package, we ensure reliable and scalable rate limiting that integrates seamlessly with the AdonisJS ecosystem.

The current implementation provides:
- **Native AdonisJS throttling** with database storage
- **Configurable rate limits** for different endpoint types
- **Authentication middleware** for route protection
- **Modular design** for easy testing and maintenance
- **Production-ready** implementation with proper error handling

This system can be easily enhanced with more sophisticated logic as the application grows, while maintaining the modular approach that allows for easy testing, maintenance, and future enhancements.
