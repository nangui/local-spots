import { test } from '@japa/runner'
import AuthMiddleware from '#middleware/auth_middleware'

test.group('Auth Middleware', () => {
  test('should allow authenticated requests to pass through', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    // Mock authenticated context
    const ctx = {
      auth: {
        authenticate: async () => {}, // Mock successful authentication
        isAuthenticated: true,
        user: { id: 1, email: 'test@example.com' }
      },
      response: {
        unauthorized: (data: any) => data
      }
    } as any

    let nextCalled = false
    const next = async () => {
      nextCalled = true
    }

    const result = await middleware.handle(ctx, next)
    
    assert.isTrue(nextCalled)
    assert.isUndefined(result)
  })

  test('should reject unauthenticated requests', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    // Mock unauthenticated context
    const ctx = {
      auth: {
        isAuthenticated: false
      },
      response: {
        unauthorized: (data: any) => data
      }
    } as any

    let nextCalled = false
    const next = async () => {
      nextCalled = true
    }

    const result = await middleware.handle(ctx, next)
    
    assert.isFalse(nextCalled)
    assert.exists(result)
  })

  test('should return proper unauthorized response', async ({ assert }) => {
    const middleware = new AuthMiddleware()
    
    // Mock unauthenticated context
    const ctx = {
      auth: {
        isAuthenticated: false
      },
      response: {
        unauthorized: (data: any) => data
      }
    } as any

    const next = async () => {}

    const result = await middleware.handle(ctx, next)
    
    assert.exists(result)
    assert.equal(result.error, 'Unauthorized')
    assert.equal(result.message, 'Authentication required')
  })
})
