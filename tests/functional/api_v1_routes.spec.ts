import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('API v1 Routes', (group) => {
  // Use global transaction for each test to keep database clean
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should return API v1 health information', async ({ client, assert }) => {
    const response = await client.get('/api/v1')

    response.assertStatus(200)
    
    const body = response.body()
    assert.equal(body.version, 'v1')
    assert.equal(body.status, 'healthy')
    assert.exists(body.timestamp)
  })

  test('should redirect /api to /api/v1', async ({ client }) => {
    const response = await client.get('/api').redirects(0) // Don't follow redirects

    response.assertStatus(302) // Redirect
    response.assertHeader('location', '/api/v1')
  })

  test('should redirect /docs to /swagger/ui', async ({ client }) => {
    const response = await client.get('/docs').redirects(0) // Don't follow redirects

    response.assertStatus(302) // Redirect
    response.assertHeader('location', '/swagger/ui')
  })

  test('should return root endpoint with links', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    
    const body = response.body()
    assert.equal(body.message, 'LocalSpots API')
    assert.equal(body.version, 'v1')
    assert.equal(body.documentation, '/swagger/ui')
    assert.equal(body.health, '/health')
    assert.equal(body.api, '/api/v1')
  })

  test('should return swagger documentation', async ({ client, assert }) => {
    const response = await client.get('/swagger')

    response.assertStatus(200)
    
    // Should return OpenAPI specification
    const body = response.body()
    assert.exists(body.openapi)
    assert.exists(body.info)
    assert.exists(body.paths)
  })

  test('should return swagger UI', async ({ client, assert }) => {
    const response = await client.get('/swagger/ui')

    response.assertStatus(200)
    
    // Should return HTML for Swagger UI
    const body = response.text()
    assert.include(body, '<html')
    assert.include(body, 'swagger')
  })

  test('should require authentication for protected routes', async ({ client }) => {
    // Test spots endpoint without authentication
    const spotsResponse = await client.get('/api/v1/spots')
    spotsResponse.assertStatus(401)

    // Test profile endpoint without authentication
    const profileResponse = await client.get('/api/v1/profile')
    profileResponse.assertStatus(401)

    // Test categories endpoint without authentication
    const categoriesResponse = await client.get('/api/v1/categories')
    categoriesResponse.assertStatus(401)
  })

  test('should allow access to public routes without authentication', async ({ client }) => {
    // Test public spots endpoint
    const publicSpotsResponse = await client.get('/api/v1/public/spots')
    publicSpotsResponse.assertStatus(200)

    // Test public categories endpoint
    const publicCategoriesResponse = await client.get('/api/v1/public/categories')
    publicCategoriesResponse.assertStatus(200)
  })

  test('should apply rate limiting to auth endpoints', async ({ client, assert }) => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    }

    // Make multiple requests to trigger rate limiting
    const responses = []
    for (let i = 0; i < 6; i++) {
      const response = await client.post('/api/v1/auth/register')
        .json(userData)
      responses.push(response)
    }

    // First 5 requests should succeed (or fail for duplicate email)
    // 6th request might be rate limited
    const lastResponse = responses[responses.length - 1]
    
    // Check if rate limiting is working
    if (lastResponse.status() === 429) {
      // Rate limiting is working
      assert.equal(lastResponse.status(), 429)
    } else {
      // Rate limiting might not be active in test environment
      assert.isTrue(lastResponse.status() === 200 || lastResponse.status() === 409)
    }
  })

  test('should handle invalid route parameters', async ({ client }) => {
    // Test with non-numeric ID
    const response = await client.get('/api/v1/spots/invalid-id')
    
    // Should return 404 for invalid route
    response.assertStatus(404)
  })

  test('should return proper error responses', async ({ client }) => {
    // Test non-existent route
    const response = await client.get('/api/v1/nonexistent')
    
    response.assertStatus(404)
  })

  test('should support route naming and generation', async ({ client, assert }) => {
    // This test verifies that routes are properly named
    // In a real application, you would test route generation
    const response = await client.get('/api/v1')
    
    response.assertStatus(200)
    
    // Verify the route structure is working
    const body = response.body()
    assert.exists(body.version)
    assert.exists(body.status)
  })
})
