# Routes Structure & Organization

## Overview

LocalSpots implements a well-organized route structure using AdonisJS advanced routing features including route groups, prefixes, named routes, and global matchers. This structure provides clarity, maintainability, and easy navigation throughout the application.

## Route Organization

### 1. Health Check Routes (`/health`)

```typescript
router
  .group(() => {
    router.get('/', [HealthChecksController, 'handle']).as('health.check')
    router.get('/ping', [HealthChecksController, 'ping']).as('health.ping')
    router.get('/detailed', [HealthChecksController, 'detailed']).as('health.detailed')
  })
  .prefix('/health')
  .as('health')
```

**Available Endpoints:**
- `GET /health` - Complete health check report
- `GET /health/ping` - Lightweight ping for load balancers
- `GET /health/detailed` - Detailed health check with categorization

**Route Names:**
- `health.check` - Main health check
- `health.ping` - Ping endpoint
- `health.detailed` - Detailed health check

### 2. API Documentation Routes (`/swagger`)

```typescript
router
  .group(() => {
    router.get('/', async () => {
      return AutoSwagger.default.docs(router.toJSON(), swagger)
    }).as('swagger.docs')
    
    router.get('/ui', async () => {
      return AutoSwagger.default.ui('/swagger', swagger)
    }).as('swagger.ui')
  })
  .prefix('/swagger')
  .as('swagger')
```

**Available Endpoints:**
- `GET /swagger` - Swagger YAML documentation
- `GET /swagger/ui` - Swagger UI interface

**Route Names:**
- `swagger.docs` - Swagger YAML
- `swagger.ui` - Swagger UI

### 3. API v1 Routes (`/api/v1`)

#### 3.1 Health Check Endpoint

```typescript
router.get('/', async () => {
  return {
    version: 'v1',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }
}).as('api.v1.health')
```

**Route Name:** `api.v1.health`

#### 3.2 Authentication Routes (`/api/v1/auth`)

```typescript
router
  .group(() => {
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.post('/login', [AuthController, 'login']).as('auth.login')
    router.post('/refresh', [AuthController, 'refresh']).as('auth.refresh')
    router.post('/logout', [AuthController, 'logout']).as('auth.logout')
  })
  .prefix('/auth')
  .as('auth')
```

**Available Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

**Route Names:**
- `auth.register` - User registration
- `auth.login` - User login
- `auth.refresh` - Token refresh
- `auth.logout` - User logout

#### 3.3 User Profile Routes (`/api/v1/profile`)

```typescript
router
  .group(() => {
    router.get('/profile', [UsersController, 'profile']).as('users.profile')
    router.put('/profile', [UsersController, 'updateProfile']).as('users.updateProfile')
  })
  .prefix('/profile')
  .as('users')
```

**Available Endpoints:**
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile

**Route Names:**
- `users.profile` - Get user profile
- `users.updateProfile` - Update user profile

#### 3.4 Spots Management (`/api/v1/spots`)

```typescript
router
  .group(() => {
    router.get('/', [SpotsController, 'index']).as('spots.index')
    router.post('/', [SpotsController, 'store']).as('spots.store')
    router.get('/:id', [SpotsController, 'show']).as('spots.show')
    router.put('/:id', [SpotsController, 'update']).as('spots.update')
    router.delete('/:id', [SpotsController, 'destroy']).as('spots.destroy')
  })
  .prefix('/spots')
  .as('spots')
```

**Available Endpoints:**
- `GET /api/v1/spots` - List all spots
- `POST /api/v1/spots` - Create new spot
- `GET /api/v1/spots/:id` - Get specific spot
- `PUT /api/v1/spots/:id` - Update specific spot
- `DELETE /api/v1/spots/:id` - Delete specific spot

**Route Names:**
- `spots.index` - List spots
- `spots.store` - Create spot
- `spots.show` - Show spot
- `spots.update` - Update spot
- `spots.destroy` - Delete spot

#### 3.5 Reviews Management (`/api/v1/spots/:spotId/reviews`)

```typescript
router
  .group(() => {
    router.get('/', [ReviewsController, 'index']).as('reviews.index')
    router.post('/', [ReviewsController, 'store']).as('reviews.store')
    router.put('/:reviewId', [ReviewsController, 'update']).as('reviews.update')
    router.delete('/:reviewId', [ReviewsController, 'destroy']).as('reviews.destroy')
  })
  .prefix('/spots/:spotId/reviews')
  .as('reviews')
```

**Available Endpoints:**
- `GET /api/v1/spots/:spotId/reviews` - List reviews for a spot
- `POST /api/v1/spots/:spotId/reviews` - Create review for a spot
- `PUT /api/v1/spots/:spotId/reviews/:reviewId` - Update specific review
- `DELETE /api/v1/spots/:spotId/reviews/:reviewId` - Delete specific review

**Route Names:**
- `reviews.index` - List reviews
- `reviews.store` - Create review
- `reviews.update` - Update review
- `reviews.destroy` - Delete review

#### 3.6 Categories (`/api/v1/categories`)

```typescript
router.get('/categories', [CategoriesController, 'index'])
  .as('categories.index')
```

**Available Endpoints:**
- `GET /api/v1/categories` - List all categories

**Route Names:**
- `categories.index` - List categories

#### 3.7 Photos Management (`/api/v1/spots/:spotId/photos`)

```typescript
router
  .group(() => {
    router.post('/', [SpotPhotosController, 'store']).as('photos.store')
    router.get('/', [SpotPhotosController, 'index']).as('photos.index')
    router.get('/:photoId', [SpotPhotosController, 'show']).as('photos.show')
    router.put('/:photoId', [SpotPhotosController, 'update']).as('photos.update')
    router.delete('/:photoId', [SpotPhotosController, 'destroy']).as('photos.destroy')
  })
  .prefix('/spots/:spotId/photos')
  .as('photos')
```

**Available Endpoints:**
- `POST /api/v1/spots/:spotId/photos` - Upload photos for a spot
- `GET /api/v1/spots/:spotId/photos` - List photos for a spot
- `GET /api/v1/spots/:spotId/photos/:photoId` - Get specific photo
- `PUT /api/v1/spots/:spotId/photos/:photoId` - Update photo metadata
- `DELETE /api/v1/spots/:spotId/photos/:photoId` - Delete specific photo

**Route Names:**
- `photos.store` - Upload photos
- `photos.index` - List photos
- `photos.show` - Show photo
- `photos.update` - Update photo
- `photos.destroy` - Delete photo

#### 3.8 Public Routes (`/api/v1/public`)

```typescript
router
  .group(() => {
    router.get('/spots', [PublicSpotsController, 'index']).as('public.spots.index')
    router.get('/spots/:id', [PublicSpotsController, 'show']).as('public.spots.show')
    router.get('/categories', [PublicCategoriesController, 'index']).as('public.categories.index')
  })
  .prefix('/public')
  .as('public')
```

**Available Endpoints:**
- `GET /api/v1/public/spots` - List public spots
- `GET /api/v1/public/spots/:id` - Get public spot details
- `GET /api/v1/public/categories` - List public categories

**Route Names:**
- `public.spots.index` - List public spots
- `public.spots.show` - Show public spot
- `public.categories.index` - List public categories

### 4. Root Route (`/`)

```typescript
router.get('/', async () => {
  return {
    message: 'LocalSpots API',
    version: 'v1',
    documentation: '/swagger/ui',
    health: '/health',
    api: '/api/v1'
  }
}).as('root')
```

**Route Name:** `root`

### 5. Legacy Route Redirects

```typescript
router.on('/docs').redirect('/swagger/ui')
router.on('/api').redirect('/api/v1')
```

**Redirects:**
- `/docs` → `/swagger/ui`
- `/api` → `/api/v1`

## Global Route Matchers

The application uses global route matchers to ensure consistent parameter validation across all routes:

```typescript
// Global route matchers
router.where('id', router.matchers.number())
router.where('spotId', router.matchers.number())
router.where('reviewId', router.matchers.number())
router.where('photoId', router.matchers.number())
```

**Matchers Applied:**
- `id` - Must be a number
- `spotId` - Must be a number
- `reviewId` - Must be a number
- `photoId` - Must be a number

## Route Naming Convention

### Naming Structure

Routes follow a hierarchical naming convention:

```
{group}.{resource}.{action}
```

**Examples:**
- `api.v1.health` - API v1 health check
- `auth.login` - Authentication login
- `users.profile` - User profile
- `spots.index` - List spots
- `reviews.store` - Create review
- `photos.destroy` - Delete photo
- `public.spots.index` - List public spots

### Benefits of Named Routes

1. **URL Generation**: Generate URLs using route names
2. **Redirects**: Redirect to routes using names
3. **Testing**: Reference routes by name in tests
4. **Maintenance**: Change URLs without updating references

## Adding Middleware

### Current Status

The routes are currently configured without middleware for development purposes. Middleware should be added progressively:

#### 1. Authentication Middleware

```typescript
// Add to protected routes
router
  .group(() => {
    // ... route definitions
  })
  .middleware('auth')
```

#### 2. Rate Limiting Middleware

```typescript
// Add rate limiting to specific route groups
router
  .group(() => {
    // ... route definitions
  })
  .middleware('throttle:60,1m')
```

#### 3. Guest Middleware

```typescript
// Add to public routes that should redirect authenticated users
router
  .group(() => {
    // ... route definitions
  })
  .middleware('guest')
```

### Recommended Middleware Implementation

#### Authentication Routes
```typescript
router
  .group(() => {
    // ... auth routes
  })
  .prefix('/auth')
  .as('auth')
  .middleware('throttle:5,1m')  // Prevent brute force
```

#### Protected Routes
```typescript
router
  .group(() => {
    // ... protected routes
  })
  .middleware('auth')
  .middleware('throttle:60,1m')
```

#### File Upload Routes
```typescript
router
  .group(() => {
    // ... photo routes
  })
  .middleware('auth')
  .middleware('throttle:10,1h')  // Prevent abuse
```

## Route Testing

### Testing Named Routes

```typescript
// In your tests
import router from '@adonisjs/core/services/router'

// Test route exists
expect(router.builder().makeSigned('spots.index')).toBeDefined()

// Test route parameters
const url = router.builder().makeSigned('spots.show', { id: 1 })
expect(url).toBe('/api/v1/spots/1')
```

### Testing Route Groups

```typescript
// Test group structure
const apiRoutes = router.toJSON().routes.filter(route => 
  route.pattern.startsWith('/api/v1')
)
expect(apiRoutes.length).toBeGreaterThan(0)
```

## Route Documentation

### Swagger Integration

Routes are automatically documented in Swagger:

- **Endpoint**: `/swagger` - Raw Swagger YAML
- **UI**: `/swagger/ui` - Interactive Swagger interface

### API Documentation

The root endpoint provides quick access to documentation:

```json
{
  "message": "LocalSpots API",
  "version": "v1",
  "documentation": "/swagger/ui",
  "health": "/health",
  "api": "/api/v1"
}
```

## Future Enhancements

### 1. Route Versioning

```typescript
// Future: Multiple API versions
router
  .group(() => {
    // v2 routes
  })
  .prefix('/api/v2')
  .as('api.v2')
```

### 2. Route Caching

```typescript
// Future: Cache route definitions
router
  .group(() => {
    // ... routes
  })
  .cacheFor('1 hour')
```

### 3. Route Analytics

```typescript
// Future: Track route usage
router
  .group(() => {
    // ... routes
  })
  .trackUsage()
```

## Best Practices

### 1. Route Organization
- Group related routes together
- Use descriptive prefixes
- Maintain consistent naming conventions

### 2. Middleware Management
- Apply middleware at the group level when possible
- Use specific middleware for specific needs
- Avoid over-engineering middleware chains

### 3. Route Naming
- Use descriptive, hierarchical names
- Follow consistent patterns
- Make names memorable and intuitive

### 4. Parameter Validation
- Use global matchers for common parameters
- Override matchers when needed
- Validate parameters at the route level

### 5. Documentation
- Keep routes well-documented
- Use Swagger for API documentation
- Maintain up-to-date route references
