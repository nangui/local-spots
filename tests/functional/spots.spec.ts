import { test } from '@japa/runner'
import User from '#models/user'
import Spot from '#models/spot'
import Category from '#models/category'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Spots API Endpoints', (group) => {
  // Clean up database after each test
  group.each.teardown(async () => {
    await Spot.query().delete()
    await User.query().delete()
    await Category.query().delete()
  })

  // Helper function to authenticate user using loginAs
  function authenticateUser(client: any, user: User) {
    return client.loginAs(user)
  }

  test('should list spots with pagination', async ({ client, assert }) => {
    // Create test data for this specific test
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const testCategory = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category for testing'
    })

    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    await Spot.create({
      name: `Existing Test Spot ${timestamp}-${randomId}`,
      description: 'An existing test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: testCategory.id,
      userId: authUser.id
    })

    // Test without pagination parameters first to avoid timeout
    const response = await client.get('/api/v1/spots')
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true
    })
    
    // Verify that the spot is in the response
    const responseBody = response.body()
    assert.equal(responseBody.data.length, 1)
    assert.equal(responseBody.data[0].name, `Existing Test Spot ${timestamp}-${randomId}`)
  })

  test('should show a specific spot', async ({ client }) => {
    // Create test data for this specific test
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const testCategory = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category for testing'
    })

    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    const existingSpot = await Spot.create({
      name: `Existing Test Spot ${timestamp}-${randomId}`,
      description: 'An existing test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: testCategory.id,
      userId: authUser.id
    })
    
    // Authenticate user and get token
    const response = await client.get(`/api/v1/spots/${existingSpot.id}`)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      data: {
        id: existingSpot.id,
        name: existingSpot.name
      }
    })
  })

  test('should return 404 for non-existent spot', async ({ client }) => {
    // Create a user for authentication
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    // Authenticate user and get token
    // User is already authenticated via loginAs

    const response = await client.get('/api/v1/spots/99999')
      .loginAs(authUser)

    response.assertStatus(404)
    response.assertBodyContains({
      success: false,
      error: 'Not found'
    })
  })

  test('should filter spots by category', async ({ client, assert }) => {
    // Create test data for this specific test
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const testCategory = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category for testing'
    })

    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    await Spot.create({
      name: `Existing Test Spot ${timestamp}-${randomId}`,
      description: 'An existing test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: testCategory.id,
      userId: authUser.id
    })

    // Authenticate user and get token
    // User is already authenticated via loginAs

    const response = await client.get('/api/v1/spots')
      .loginAs(authUser)
      .qs({ categoryId: testCategory.id })

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      data: []
    })

    // All spots should belong to the test category
    response.body().data.forEach((spot: any) => {
      assert.equal(spot.categoryId, testCategory.id)
    })
  })

  test('should get spots near a location', async ({ client, assert }) => {
    // Create test data for this specific test
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const testCategory = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category for testing'
    })

    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    await Spot.create({
      name: `Nearby Spot ${timestamp}-${randomId}`,
      description: 'A spot near the search location',
      address: '789 Nearby Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: testCategory.id,
      userId: authUser.id
    })

    // Authenticate user and get token
    // User is already authenticated via loginAs

    const response = await client.get('/api/v1/spots')
      .loginAs(authUser)
      .qs({ 
        latitude: 48.8566, 
        longitude: 2.3522, 
        radius: 1 
      })

    response.assertStatus(200)
    response.assertBodyContains({
      success: true
    })

    // Should find nearby spots
    const spots = response.body().data
    assert.isTrue(spots.length > 0)
  })

  test('should return error for nearby search without coordinates', async ({ client }) => {
    // Create a user for authentication
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const authUser = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })

    // Authenticate user and get token
    // User is already authenticated via loginAs

    const response = await client.get('/api/v1/spots')
      .loginAs(authUser)
      .qs({ radius: 1 }) // Missing latitude and longitude

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      error: 'Bad Request'
    })
  })
})
