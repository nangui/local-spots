import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Import throttle middlewares
import {
  authThrottle,
  userThrottle,
  spotsThrottle,
  reviewsThrottle,
  categoriesThrottle,
  photosThrottle,
  publicThrottle,
  healthThrottle
} from '#start/limiter'

// Import controllers
import AuthController from '#controllers/v1/auth_controller'
import UsersController from '#controllers/v1/users_controller'
import SpotsController from '#controllers/v1/spots_controller'
import ReviewsController from '#controllers/v1/reviews_controller'
import CategoriesController from '#controllers/v1/categories_controller'
import SpotPhotosController from '#controllers/v1/spot_photos_controller'
import PublicSpotsController from '#controllers/v1/public/spots_controller'
import PublicCategoriesController from '#controllers/v1/public/categories_controller'
import HealthChecksController from '#controllers/health_checks_controller'

// Global route matchers
router.where('id', router.matchers.number())
router.where('spotId', router.matchers.number())
router.where('reviewId', router.matchers.number())
router.where('photoId', router.matchers.number())

// Health Check Routes (Public - for monitoring services)
router
  .group(() => {
    router.get('/', [HealthChecksController, 'handle']).as('health.check')
    router.get('/ping', [HealthChecksController, 'ping']).as('health.ping')
    router.get('/detailed', [HealthChecksController, 'detailed']).as('health.detailed')
  })
  .prefix('/health')
  .as('health')
  .use(healthThrottle)

// API Documentation Routes - Real Swagger UI with OpenAPI specification
router
  .group(() => {
    // OpenAPI specification
    router.get('/', async () => {
      return {
        openapi: "3.0.0",
        info: {
          title: "LocalSpots API",
          version: "1.0.0",
          description: "LocalSpots is a location discovery platform that allows users to discover interesting places around them",
          contact: {
            name: "LocalSpots Team",
            email: "support@localspots.com"
          }
        },
        servers: [
          {
            url: "http://localhost:3333",
            description: "Development server"
          }
        ],
        paths: {
          "/api/v1/auth/register": {
            post: {
              tags: ["Authentication"],
              summary: "Register a new user",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["email", "password", "fullName"],
                      properties: {
                        email: {
                          type: "string",
                          format: "email",
                          description: "User email address"
                        },
                        password: {
                          type: "string",
                          minLength: 8,
                          description: "User password (minimum 8 characters)"
                        },
                        fullName: {
                          type: "string",
                          description: "User full name"
                        }
                      }
                    }
                  }
                }
              },
              responses: {
                "201": {
                  description: "User registered successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          user: {
                            type: "object",
                            properties: {
                              id: { type: "number" },
                              email: { type: "string" },
                              fullName: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "400": {
                  description: "Bad request - validation error"
                },
                "409": {
                  description: "Conflict - user already exists"
                }
              }
            }
          },
          "/api/v1/auth/login": {
            post: {
              tags: ["Authentication"],
              summary: "Login user",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["email", "password"],
                      properties: {
                        email: {
                          type: "string",
                          format: "email"
                        },
                        password: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              },
              responses: {
                "200": {
                  description: "Login successful",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          message: { type: "string" },
                          user: {
                            type: "object",
                            properties: {
                              id: { type: "number" },
                              email: { type: "string" },
                              fullName: { type: "string" }
                            }
                          },
                          token: { type: "string" }
                        }
                      }
                    }
                  }
                },
                "401": {
                  description: "Unauthorized - invalid credentials"
                }
              }
            }
          },
          "/api/v1/spots": {
            get: {
              tags: ["Spots"],
              summary: "Get all spots",
              security: [{ BearerAuth: [] }],
              responses: {
                "200": {
                  description: "List of spots retrieved successfully"
                },
                "401": {
                  description: "Unauthorized - authentication required"
                }
              }
            },
            post: {
              tags: ["Spots"],
              summary: "Create a new spot",
              security: [{ BearerAuth: [] }],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["name", "description", "latitude", "longitude"],
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        latitude: { type: "number" },
                        longitude: { type: "number" },
                        categoryId: { type: "number" }
                      }
                    }
                  }
                }
              },
              responses: {
                "201": {
                  description: "Spot created successfully"
                },
                "400": {
                  description: "Bad request - validation error"
                },
                "401": {
                  description: "Unauthorized - authentication required"
                }
              }
            }
          },
          "/api/v1/spots/{id}": {
            get: {
              tags: ["Spots"],
              summary: "Get spot by ID",
              security: [{ BearerAuth: [] }],
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: { type: "number" },
                  description: "Spot ID"
                }
              ],
              responses: {
                "200": {
                  description: "Spot details retrieved successfully"
                },
                "404": {
                  description: "Spot not found"
                }
              }
            }
          },
          "/api/v1/spots/{spotId}/photos": {
            post: {
              tags: ["Photos"],
              summary: "Upload photos for a spot",
              security: [{ BearerAuth: [] }],
              parameters: [
                {
                  name: "spotId",
                  in: "path",
                  required: true,
                  schema: { type: "number" },
                  description: "Spot ID"
                }
              ],
              requestBody: {
                required: true,
                content: {
                  "multipart/form-data": {
                    schema: {
                      type: "object",
                      properties: {
                        photos: {
                          type: "array",
                          items: {
                            type: "string",
                            format: "binary"
                          },
                          description: "Photo files to upload"
                        }
                      }
                    }
                  }
                }
              },
              responses: {
                "201": {
                  description: "Photos uploaded successfully"
                },
                "400": {
                  description: "Bad request - validation error"
                },
                "401": {
                  description: "Unauthorized - authentication required"
                }
              }
            }
          }
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "JWT token for authentication"
            }
          }
        },
        tags: [
          {
            name: "Authentication",
            description: "User authentication endpoints"
          },
          {
            name: "Users",
            description: "User management endpoints"
          },
          {
            name: "Spots",
            description: "Location spots management"
          },
          {
            name: "Reviews",
            description: "Spot reviews management"
          },
          {
            name: "Categories",
            description: "Spot categories"
          },
          {
            name: "Photos",
            description: "Spot photos management"
          },
          {
            name: "Public",
            description: "Public endpoints (no auth required)"
          }
        ]
      }
    }).as('swagger.spec')
    
    // Swagger UI
    router.get('/ui', async ({ response }) => {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      
      try {
        const htmlPath = path.join(process.cwd(), 'resources', 'views', 'swagger-ui.html');
        const html = await fs.readFile(htmlPath, 'utf-8');
        
        response.header('Content-Type', 'text/html');
        return html;
      } catch (error) {
        console.error('Error reading Swagger UI HTML:', error);
        
        // Fallback HTML si le fichier n'est pas trouvé
        const fallbackHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>LocalSpots API - Swagger UI</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .container { max-width: 800px; margin: 0 auto; }
              .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .method { font-weight: bold; color: #667eea; }
              .url { font-family: monospace; background: #f5f5f5; padding: 5px; }
              .description { margin-top: 10px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>LocalSpots API Documentation</h1>
              <p>Welcome to the LocalSpots API documentation. Below are all available endpoints:</p>
              
              <h2>Authentication</h2>
              <div class="endpoint">
                <div class="method">POST</div>
                <div class="url">/api/v1/auth/register</div>
                <div class="description">Register a new user account</div>
              </div>
              <div class="endpoint">
                <div class="method">POST</div>
                <div class="url">/api/v1/auth/login</div>
                <div class="description">Login with email and password</div>
              </div>
              <div class="endpoint">
                <div class="method">POST</div>
                <div class="url">/api/v1/auth/logout</div>
                <div class="description">Logout and invalidate token</div>
              </div>
              
              <h2>Spots</h2>
              <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/v1/spots</div>
                <div class="description">Get all spots (requires authentication)</div>
              </div>
              <div class="endpoint">
                <div class="method">POST</div>
                <div class="url">/api/v1/spots</div>
                <div class="description">Create a new spot (requires authentication)</div>
              </div>
              <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/v1/spots/:id</div>
                <div class="description">Get spot details by ID (requires authentication)</div>
              </div>
              
              <h2>Photos</h2>
              <div class="endpoint">
                <div class="method">POST</div>
                <div class="url">/api/v1/spots/:spotId/photos</div>
                <div class="description">Upload photos for a spot (requires authentication)</div>
              </div>
              
              <h2>Health Check</h2>
              <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/health</div>
                <div class="description">Check application health status</div>
              </div>
              
              <p><strong>Note:</strong> Most endpoints require Bearer token authentication. Use the /api/v1/auth/login endpoint to get a token.</p>
              <p><a href="/swagger" target="_blank">View OpenAPI Specification (JSON)</a></p>
            </div>
          </body>
          </html>
        `;
        
        response.header('Content-Type', 'text/html');
        return fallbackHtml;
      }
    }).as('swagger.ui')
  })
  .prefix('/swagger')
  .as('swagger')

// API v1 Routes
router
  .group(() => {
    // Health check endpoint
    router.get('/', async () => {
      return {
        version: 'v1',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    }).as('api.v1.health')

    // Auth routes (no auth required) - Strict rate limiting to prevent brute force
    router
      .group(() => {
        router.post('/register', [AuthController, 'register']).as('auth.register')
        router.post('/login', [AuthController, 'login']).as('auth.login')
      })
      .prefix('/auth')
      .as('auth')
      .use(authThrottle)

    // Auth routes (auth required) - Moderate rate limiting
    router
      .group(() => {
        router.post('/refresh', [AuthController, 'refresh']).as('auth.refresh')
        router.post('/logout', [AuthController, 'logout']).as('auth.logout')
        router.put('/change-password', [AuthController, 'changePassword']).as('auth.changePassword')
      })
      .prefix('/auth')
      .as('auth.protected')
      .use([middleware.auth()])
      .use(authThrottle)

    // Protected routes (auth required) - Moderate rate limiting
    router
      .group(() => {
        router.get('/:id', [UsersController, 'show']).as('users.show')
        router.put('/:id', [UsersController, 'update']).as('users.update')
        router.put('/:id/password', [UsersController, 'changePassword']).as('users.changePassword')
        router.get('/:id/spots', [UsersController, 'spots']).as('users.spots')
        router.get('/:id/reviews', [UsersController, 'reviews']).as('users.reviews')
        router.get('/:id/stats', [UsersController, 'stats']).as('users.stats')
      })
      .prefix('/users')
      .as('users')
      .use([middleware.auth()])
      .use(userThrottle)

    // Profile routes (alias for current user)
    router.get('/profile', [UsersController, 'profile']).as('profile.show').use([middleware.auth()]).use(userThrottle)
    router.put('/profile', [UsersController, 'updateProfile']).as('profile.update').use([middleware.auth()]).use(userThrottle)

    // Spots management
    router
      .group(() => {
        router.get('/', [SpotsController, 'index']).as('spots.index')
        router.post('/', [SpotsController, 'store']).as('spots.store')
        router.get('/:id', [SpotsController, 'show']).as('spots.show')
        router.put('/:id', [SpotsController, 'update']).as('spots.update')
        router.delete('/:id', [SpotsController, 'destroy']).as('spots.destroy')
        router.get('/nearby', [SpotsController, 'nearby']).as('spots.nearby')
      })
      .prefix('/spots')
      .as('spots')
      .use([middleware.auth()])
      .use(spotsThrottle)
    
    // Reviews management
    router
      .group(() => {
        router.get('/', [ReviewsController, 'index']).as('reviews.index')
        router.post('/', [ReviewsController, 'store']).as('reviews.store')
        router.get('/:id', [ReviewsController, 'show']).as('reviews.show')
        router.put('/:id', [ReviewsController, 'update']).as('reviews.update')
        router.delete('/:id', [ReviewsController, 'destroy']).as('reviews.destroy')
        router.get('/recent', [ReviewsController, 'recent']).as('reviews.recent')
        router.get('/by-rating', [ReviewsController, 'byRating']).as('reviews.byRating')
      })
      .prefix('/spots/:spotId/reviews')
      .as('reviews')
      .use([middleware.auth()])
      .use(reviewsThrottle)
    
    // Categories
    router
      .group(() => {
        router.get('/', [CategoriesController, 'index']).as('categories.index')
        router.get('/:id', [CategoriesController, 'show']).as('categories.show')
        router.post('/', [CategoriesController, 'store']).as('categories.store')
        router.put('/:id', [CategoriesController, 'update']).as('categories.update')
        router.delete('/:id', [CategoriesController, 'destroy']).as('categories.destroy')
        router.get('/with-spot-count', [CategoriesController, 'withSpotCount']).as('categories.withSpotCount')
        router.get('/popular', [CategoriesController, 'popular']).as('categories.popular')
        router.get('/search', [CategoriesController, 'search']).as('categories.search')
      })
      .prefix('/categories')
      .as('categories')
      .use([middleware.auth()])
      .use(categoriesThrottle)
    
    // Photos - Strict rate limiting for file uploads
    router
      .group(() => {
        router.post('/', [SpotPhotosController, 'uploadMultiple']).as('photos.uploadMultiple')
        router.get('/', [SpotPhotosController, 'index']).as('photos.index')
        router.get('/:photoId', [SpotPhotosController, 'show']).as('photos.show')
        router.put('/:photoId', [SpotPhotosController, 'update']).as('photos.update')
        router.delete('/:photoId', [SpotPhotosController, 'destroy']).as('photos.destroy')
      })
      .prefix('/spots/:spotId/photos')
      .as('photos')
      .use([middleware.auth()])
      .use(photosThrottle)

    // Public routes (no auth required) - Moderate rate limiting
    router
      .group(() => {
        router.get('/spots', [PublicSpotsController, 'index']).as('public.spots.index')
        router.get('/spots/:id', [PublicSpotsController, 'show']).as('public.spots.show')
        router.get('/categories', [PublicCategoriesController, 'index']).as('public.categories.index')
      })
      .prefix('/public')
      .as('public')
      .use(publicThrottle)

  })
  .prefix('/api/v1')
  .as('api.v1')

// Legacy route for backward compatibility
router.get('/', async () => {
  return {
    message: 'LocalSpots API',
    version: 'v1',
    documentation: '/swagger/ui',
    health: '/health',
    api: '/api/v1'
  }
}).as('root')

// Redirect old routes to new structure
router.get('/docs', ({ response }) => {
  return response.redirect('/swagger/ui')
})
router.get('/api', ({ response }) => {
  return response.redirect('/api/v1')
})
