import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Authentication Endpoints', (group) => {
  // Use global transaction for each test to keep database clean
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should register a new user successfully', async ({ client, assert }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    const response = await client.post('/api/v1/auth/register')
      .json(userData)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'User registered successfully',
      user: {
        email: userData.email,
        fullName: userData.fullName
      }
    })

    // Check that token is returned
    assert.exists(response.body().token)

    // Verify user was created in database
    const user = await User.findBy('email', userData.email)
    assert.exists(user)
    assert.equal(user!.email, userData.email)
  })

  test('should return error for duplicate email registration', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    // Register first user
    await client.post('/api/v1/auth/register').json(userData)

    // Try to register second user with same email
    const response = await client.post('/api/v1/auth/register')
      .json(userData)

    response.assertStatus(409)
    response.assertBodyContains({
      error: 'Conflict',
      message: 'User with this email already exists'
    })
  })

  test('should return error for missing required fields', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const response = await client.post('/api/v1/auth/register')
      .json({
        email: `test${timestamp}-${randomId}@example.com`
        // Missing password and fullName
      })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Missing required fields',
      message: 'Email, password, and fullName are required'
    })
  })

  test('should login user with valid credentials', async ({ client, assert }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    // Register user first
    await client.post('/api/v1/auth/register').json(userData)

    // Login with valid credentials
    const response = await client.post('/api/v1/auth/login')
      .json({
        email: userData.email,
        password: userData.password
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Login successful',
      user: {
        email: userData.email,
        fullName: userData.fullName
      }
    })

    // Check that token is returned
    assert.exists(response.body().token)
  })

  test('should return error for invalid email during login', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const response = await client.post('/api/v1/auth/login')
      .json({
        email: `nonexistent${timestamp}-${randomId}@example.com`,
        password: 'password123'
      })

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    })
  })

  test('should return error for invalid password during login', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    // Register user first
    await client.post('/api/v1/auth/register').json(userData)

    // Try to login with wrong password
    const response = await client.post('/api/v1/auth/login')
      .json({
        email: userData.email,
        password: 'wrongpassword'
      })

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    })
  })

  test('should return error for missing credentials during login', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const response = await client.post('/api/v1/auth/login')
      .json({
        email: `test${timestamp}-${randomId}@example.com`
        // Missing password
      })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Missing required fields',
      message: 'Email and password are required'
    })
  })

  test('should refresh token successfully', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    // Register user
    await client.post('/api/v1/auth/register').json(userData)
    
    // Create user object for authentication
    const user = await User.findBy('email', userData.email)

    // Refresh token using loginAs
    const response = await client.post('/api/v1/auth/refresh')
      .loginAs(user!)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Token is valid',
      user: {
        email: userData.email,
        fullName: userData.fullName
      }
    })
  })

  test('should return error for invalid token during refresh', async ({ client }) => {
    const response = await client.post('/api/v1/auth/refresh')
      .header('Authorization', 'Bearer invalid-token')

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Unauthorized',
      message: 'Authentication required'
    })
  })

  test('should logout user successfully', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    }

    // Register user
    await client.post('/api/v1/auth/register').json(userData)
    
    // Create user object for authentication
    const user = await User.findBy('email', userData.email)

    // Logout using loginAs
    const response = await client.post('/api/v1/auth/logout')
      .loginAs(user!)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logout successful'
    })
  })

  test('should change password successfully', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'oldpassword',
      fullName: 'Test User'
    }

    // Register user
    await client.post('/api/v1/auth/register').json(userData)
    
    // Create user object for authentication
    const user = await User.findBy('email', userData.email)

    // Change password using loginAs
    const response = await client.put('/api/v1/auth/change-password')
      .loginAs(user!)
      .json({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Password changed successfully'
    })

    // Verify new password works
    const newLoginResponse = await client.post('/api/v1/auth/login')
      .json({
        email: userData.email,
        password: 'newpassword123'
      })

    newLoginResponse.assertStatus(200)
  })

  test('should return error for wrong current password', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'oldpassword',
      fullName: 'Test User'
    }

    // Register user
    await client.post('/api/v1/auth/register').json(userData)
    
    // Create user object for authentication
    const user = await User.findBy('email', userData.email)

    // Try to change password with wrong current password
    const response = await client.put('/api/v1/auth/change-password')
      .loginAs(user!)
      .json({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Invalid password',
      message: 'Current password is incorrect'
    })
  })

  test('should return error for short new password', async ({ client }) => {
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const userData = {
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'oldpassword',
      fullName: 'Test User'
    }

    // Register user
    await client.post('/api/v1/auth/register').json(userData)
    
    // Create user object for authentication
    const user = await User.findBy('email', userData.email)

    // Try to change password with short new password
    const response = await client.put('/api/v1/auth/change-password')
      .loginAs(user!)
      .json({
        currentPassword: 'oldpassword',
        newPassword: '123' // Too short
      })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Invalid password',
      message: 'New password must be at least 8 characters long'
    })
  })
})
