import { test } from '@japa/runner'
import ReviewService from '#services/review_service'
import Category from '#models/category'
import User from '#models/user'
import Spot from '#models/spot'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('ReviewService', (group) => {
  // Use global transaction for each test to keep database clean
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should create a review successfully', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const reviewData = {
      comment: 'Great spot! Really enjoyed it.',
      rating: 5,
      spotId: spot.id,
      userId: user.id
    }

    const review = await reviewService.create(reviewData)
    
    assert.exists(review.id)
    assert.equal(review.comment, reviewData.comment)
    assert.equal(review.rating, reviewData.rating)
    assert.equal(review.spotId, reviewData.spotId)
    assert.equal(review.userId, reviewData.userId)
  })

  test('should prevent duplicate reviews from same user', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const reviewData = {
      comment: 'Great spot! Really enjoyed it.',
      rating: 5,
      spotId: spot.id,
      userId: user.id
    }

    // Create first review
    await reviewService.create(reviewData)
    
    // Try to create duplicate review
    try {
      await reviewService.create(reviewData)
      assert.fail('Should not allow duplicate reviews')
    } catch (error) {
      assert.equal(error.message, 'User has already reviewed this spot')
    }
  })

  test('should get reviews by spot with pagination', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user1 = await User.create({
      email: `user1-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 1'
    })
    
    const user2 = await User.create({
      email: `user2-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 2'
    })
    
    const user3 = await User.create({
      email: `user3-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 3'
    })
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user1.id
    })
    
    // Create multiple reviews for the same spot
    const reviewsData = [
      {
        comment: 'Great spot!',
        rating: 5,
        spotId: spot.id,
        userId: user1.id
      },
      {
        comment: 'Nice place',
        rating: 4,
        spotId: spot.id,
        userId: user2.id
      },
      {
        comment: 'Good experience',
        rating: 4,
        spotId: spot.id,
        userId: user3.id
      }
    ]
    
    for (const reviewData of reviewsData) {
      await reviewService.create(reviewData)
    }
    
    const result = await reviewService.getBySpot(spot.id, 1, 10)
    
    assert.equal(result.toJSON().data.length, 3)
    assert.equal(result.toJSON().meta.total, 3)
  })

  test('should get review by ID successfully', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const reviewData = {
      comment: 'Test review',
      rating: 4,
      spotId: spot.id,
      userId: user.id
    }
    
    const createdReview = await reviewService.create(reviewData)
    const retrievedReview = await reviewService.getById(createdReview.id)
    
    assert.equal(retrievedReview.id, createdReview.id)
    assert.equal(retrievedReview.comment, createdReview.comment)
    assert.equal(retrievedReview.rating, createdReview.rating)
  })

  test('should update review successfully', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const reviewData = {
      comment: 'Original comment',
      rating: 3,
      spotId: spot.id,
      userId: user.id
    }
    
    const createdReview = await reviewService.create(reviewData)
    
    // Update the review
    const updateData = {
      comment: 'Updated comment',
      rating: 5
    }
    
    const updatedReview = await reviewService.update(createdReview.id, updateData, user.id)
    
    assert.equal(updatedReview.comment, updateData.comment)
    assert.equal(updatedReview.rating, updateData.rating)
    assert.equal(updatedReview.id, createdReview.id)
  })

  test('should delete review successfully', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const reviewData = {
      comment: 'Review to delete',
      rating: 4,
      spotId: spot.id,
      userId: user.id
    }
    
    const createdReview = await reviewService.create(reviewData)
    
    // Delete the review
    await reviewService.delete(createdReview.id, user.id)
    
    // Try to retrieve the deleted review
    try {
      await reviewService.getById(createdReview.id)
      assert.fail('Review should not exist after deletion')
    } catch (error) {
      // Expected error - review not found
      assert.exists(error)
    }
  })

  test('should get reviews by user', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
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
    
    const spot1 = await Spot.create({
      name: `Spot 1 ${timestamp}-${randomId}`,
      description: 'First test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user.id
    })
    
    const spot2 = await Spot.create({
      name: `Spot 2 ${timestamp}-${randomId}`,
      description: 'Second test spot',
      address: '456 Test Avenue',
      latitude: 48.8600,
      longitude: 2.3500,
      categoryId: category.id,
      userId: user.id
    })
    
    // Create reviews for different spots by the same user
    const reviewsData = [
      {
        comment: 'Great first spot!',
        rating: 5,
        spotId: spot1.id,
        userId: user.id
      },
      {
        comment: 'Nice second spot',
        rating: 4,
        spotId: spot2.id,
        userId: user.id
      }
    ]
    
    for (const reviewData of reviewsData) {
      await reviewService.create(reviewData)
    }
    
    const result = await reviewService.getByUser(user.id, 1, 10)
    
    assert.equal(result.toJSON().data.length, 2)
    result.toJSON().data.forEach((review: any) => {
      assert.equal(review.userId, user.id)
    })
  })

  test('should get recent reviews', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user1 = await User.create({
      email: `user1-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 1'
    })
    
    const user2 = await User.create({
      email: `user2-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 2'
    })
    
    const user3 = await User.create({
      email: `user3-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 3'
    })
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user1.id
    })
    
    // Create multiple reviews by different users with delays to ensure different timestamps
    const reviewsData = [
      {
        comment: 'First review',
        rating: 3,
        spotId: spot.id,
        userId: user1.id
      },
      {
        comment: 'Second review',
        rating: 4,
        spotId: spot.id,
        userId: user2.id
      },
      {
        comment: 'Third review',
        rating: 5,
        spotId: spot.id,
        userId: user3.id
      }
    ]
    
    // Create reviews with explicit timestamps to ensure proper ordering
    const now = DateTime.now()
    const reviewsWithTimestamps = [
      { ...reviewsData[0], createdAt: now.minus({ seconds: 2 }) }, // Oldest
      { ...reviewsData[1], createdAt: now.minus({ seconds: 1 }) }, // Middle
      { ...reviewsData[2], createdAt: now }                        // Newest
    ]
    
    for (const reviewData of reviewsWithTimestamps) {
      await reviewService.create(reviewData)
    }
    
    const result = await reviewService.getRecent(5)
    
    assert.equal(result.length, 3)
    // Reviews should be ordered by creation date (newest first)
    assert.equal(result[0].comment, 'Third review')
  })

  test('should get reviews by rating', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user1 = await User.create({
      email: `user1-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 1'
    })
    
    const user2 = await User.create({
      email: `user2-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 2'
    })
    
    const user3 = await User.create({
      email: `user3-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 3'
    })
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user1.id
    })
    
    // Create reviews with different ratings by different users
    const reviewsData = [
      {
        comment: 'Poor experience',
        rating: 1,
        spotId: spot.id,
        userId: user1.id
      },
      {
        comment: 'Average experience',
        rating: 3,
        spotId: spot.id,
        userId: user2.id
      },
      {
        comment: 'Great experience',
        rating: 5,
        spotId: spot.id,
        userId: user3.id
      }
    ]
    
    for (const reviewData of reviewsData) {
      await reviewService.create(reviewData)
    }
    
    const result = await reviewService.getByRating(5, 1, 10)
    
    assert.equal(result.toJSON().data.length, 1)
    assert.equal(result[0].rating, 5)
    assert.equal(result[0].comment, 'Great experience')
  })

  test('should get spot statistics', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user1 = await User.create({
      email: `user1-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 1'
    })
    
    const user2 = await User.create({
      email: `user2-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 2'
    })
    
    const user3 = await User.create({
      email: `user3-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 3'
    })
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user1.id
    })
    
    // Create reviews with different ratings by different users
    const reviewsData = [
      {
        comment: 'Good experience',
        rating: 4,
        spotId: spot.id,
        userId: user1.id
      },
      {
        comment: 'Great experience',
        rating: 5,
        spotId: spot.id,
        userId: user2.id
      },
      {
        comment: 'Average experience',
        rating: 3,
        spotId: spot.id,
        userId: user3.id
      }
    ]
    
    for (const reviewData of reviewsData) {
      await reviewService.create(reviewData)
    }
    
    const stats = await reviewService.getSpotStats(spot.id)
    
    assert.exists(stats)
    assert.equal(stats.averageRating, 4) // (4+5+3)/3 = 4
    assert.equal(stats.reviewCount, 3)
  })

  test('should check if user can modify review', async ({ assert }) => {
    const reviewService = new ReviewService()
    
    // Create test data first with unique names
    const timestamp = Date.now()
    const randomId = Math.floor(Math.random() * 10000)
    
    const category = await Category.create({
      name: `Test Category ${timestamp}-${randomId}`,
      description: 'A test category'
    })
    
    const user1 = await User.create({
      email: `user1-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 1'
    })
    
    const user2 = await User.create({
      email: `user2-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      fullName: 'User 2'
    })
    
    const spot = await Spot.create({
      name: `Test Spot ${timestamp}-${randomId}`,
      description: 'A test spot',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      categoryId: category.id,
      userId: user1.id
    })
    
    const reviewData = {
      comment: 'Test review',
      rating: 4,
      spotId: spot.id,
      userId: user1.id
    }
    
    const createdReview = await reviewService.create(reviewData)
    
    // User 1 should be able to modify their own review
    assert.isTrue(await reviewService.canModify(createdReview.id, user1.id))
    
    // User 2 should not be able to modify User 1's review
    assert.isFalse(await reviewService.canModify(createdReview.id, user2.id))
  })
})
