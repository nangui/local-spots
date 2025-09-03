import { test } from '@japa/runner'

test.group('API v1 Routes', () => {
  test('health check endpoint returns correct response', async ({ client }) => {
    const response = await client.get('/api/v1')
    
    response.assertStatus(200)
    response.assertBodyContains({
      version: 'v1',
      status: 'healthy'
    })
    response.assertBodyContains('timestamp')
  })

  test('auth register endpoint returns placeholder message', async ({ client }) => {
    const response = await client.post('/api/v1/auth/register')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Register endpoint - to be implemented'
    })
  })

  test('auth login endpoint returns placeholder message', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Login endpoint - to be implemented'
    })
  })

  test('auth refresh endpoint returns placeholder message', async ({ client }) => {
    const response = await client.post('/api/v1/auth/refresh')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Refresh token endpoint - to be implemented'
    })
  })

  test('auth logout endpoint returns placeholder message', async ({ client }) => {
    const response = await client.post('/api/v1/auth/logout')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logout endpoint - to be implemented'
    })
  })

  test('public spots endpoint returns placeholder message', async ({ client }) => {
    const response = await client.get('/api/v1/public/spots')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Public list spots endpoint - to be implemented'
    })
  })

  test('public categories endpoint returns placeholder message', async ({ client }) => {
    const response = await client.get('/api/v1/public/categories')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Public list categories endpoint - to be implemented'
    })
  })

  test('root endpoint returns API information', async ({ client }) => {
    const response = await client.get('/')
    
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'LocalSpots API',
      version: 'v1',
      documentation: '/docs'
    })
  })

  test('swagger documentation is accessible', async ({ client }) => {
    const response = await client.get('/swagger')
    
    response.assertStatus(200)
  })

  test('swagger UI is accessible', async ({ client }) => {
    const response = await client.get('/docs')
    
    response.assertStatus(200)
  })
})
