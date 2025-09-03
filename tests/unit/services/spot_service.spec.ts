import { test } from '@japa/runner'
import SpotService from '#services/spot_service'
import Spot from '#models/spot'
import Category from '#models/category'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'

test.group('SpotService', (group) => {
  // Use global transaction for each test to keep database clean
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should create a spot successfully', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test category and user first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })
    
    const spotData = {
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot for testing',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    }

    const spot = await spotService.create(spotData)
    
    assert.exists(spot.id)
    assert.equal(spot.name, spotData.name)
    assert.equal(spot.description, spotData.description)
    assert.equal(spot.address, spotData.address)
    assert.equal(spot.latitude, spotData.latitude)
    assert.equal(spot.longitude, spotData.longitude)
    assert.equal(spot.categoryId, spotData.categoryId)
    assert.equal(spot.userId, spotData.userId)
  })

  test('should get spot by ID successfully', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test category and user first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create a test spot first
    const spotData = {
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot for testing',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    }
    
    const createdSpot = await spotService.create(spotData)
    const retrievedSpot = await spotService.getById(createdSpot.id)
    
    assert.equal(retrievedSpot.id, createdSpot.id)
    assert.equal(retrievedSpot.name, createdSpot.name)
  })

  test('should get all spots with pagination', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test category and user first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user = await User.create({
      email: `test${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create multiple test spots
    const spotsData = [
      {
        name: 'Spot 1',
        description: 'First test spot',
        address: '123 Test Street',
        latitude: 48.8566,
        longitude: 2.3522,
        categoryId: category.id,
        userId: user.id
      },
      {
        name: 'Spot 2',
        description: 'Second test spot',
        address: '456 Test Avenue',
        latitude: 48.8600,
        longitude: 2.3500,
        categoryId: category.id,
        userId: user.id
      }
    ]
    
    for (const spotData of spotsData) {
      await spotService.create(spotData)
    }
    
    const result = await spotService.getAll({ page: 1, limit: 10 })
    
    assert.equal(result.toJSON().data.length, 2)
    assert.equal(result.toJSON().meta.total, 2)
  })

  test('should filter spots by category', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test categories and user first
    const category1 = await Category.create({
      name: 'Restaurant',
      description: 'Restaurant category'
    })
    
    const category2 = await Category.create({
      name: 'Park',
      description: 'Park category'
    })
    
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create spots with different categories
    const spotsData = [
      {
        name: 'Restaurant',
        description: 'A restaurant',
        address: '123 Test Street',
        latitude: 48.8566,
        longitude: 2.3522,
        categoryId: category1.id,
        userId: user.id
      },
      {
        name: 'Park',
        description: 'A park',
        address: '456 Test Avenue',
        latitude: 48.8600,
        longitude: 2.3500,
        categoryId: category2.id,
        userId: user.id
      }
    ]
    
    for (const spotData of spotsData) {
      await spotService.create(spotData)
    }
    
    const result = await spotService.getAll({ categoryId: category1.id })
    
    assert.equal(result.toJSON().data.length, 1)
    assert.equal(result.toJSON().data[0].categoryId, category1.id)
  })

  test('should update spot successfully', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test category and user first
    const category = await Category.create({
      name: 'Test Category',
      description: 'A test category'
    })
    
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create a test spot first
    const spotData = {
      name: 'Original Name',
      description: 'Original description',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    }
    
    const createdSpot = await spotService.create(spotData)
    
    // Update the spot
    const updateData = {
      name: 'Updated Name',
      description: 'Updated description'
    }
    
    const updatedSpot = await spotService.update(createdSpot.id, updateData)
    
    assert.equal(updatedSpot.name, updateData.name)
    assert.equal(updatedSpot.description, updateData.description)
    assert.equal(updatedSpot.id, createdSpot.id)
  })

  test('should delete spot successfully', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test category and user first
    const category = await Category.create({
      name: 'Test Category',
      description: 'A test category'
    })
    
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create a test spot first
    const spotData = {
      name: 'Spot to Delete',
      description: 'This spot will be deleted',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    }
    
    const createdSpot = await spotService.create(spotData)
    
    // Delete the spot
    await spotService.delete(createdSpot.id)
    
    // Try to retrieve the deleted spot - should throw an error
    try {
      await spotService.getById(createdSpot.id)
      assert.fail('Should not be able to retrieve deleted spot')
    } catch (error) {
      // Expected error - spot not found
      assert.exists(error)
    }
  })

  test('should get spots by category', async ({ assert }) => {
    const spotService = new SpotService()
    
    // Create test categories and user first
    const category1 = await Category.create({
      name: 'Restaurant',
      description: 'Restaurant category'
    })
    
    const category2 = await Category.create({
      name: 'Park',
      description: 'Park category'
    })
    
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    })
    
    // Create spots with different categories
    const spotsData = [
      {
        name: 'Restaurant 1',
        description: 'First restaurant',
        address: '123 Test Street',
        latitude: 48.8566,
        longitude: 2.3522,
        categoryId: category1.id,
        userId: user.id
      },
      {
        name: 'Restaurant 2',
        description: 'Second restaurant',
        address: '456 Test Avenue',
        latitude: 48.8600,
        longitude: 2.3500,
        categoryId: category1.id,
        userId: user.id
      },
      {
        name: 'Park 1',
        description: 'A park',
        address: '789 Park Street',
        latitude: 48.8650,
        longitude: 2.3450,
        categoryId: category2.id,
        userId: user.id
      }
    ]
    
    for (const spotData of spotsData) {
      await spotService.create(spotData)
    }
    
    const result = await spotService.getByCategory(category1.id)
    
    assert.equal(result.toJSON().data.length, 2)
    result.toJSON().data.forEach((spot: any) => {
      assert.equal(spot.categoryId, category1.id)
    })
  })
})
