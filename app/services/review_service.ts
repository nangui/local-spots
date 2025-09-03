import Review from '#models/review'
import { inject } from '@adonisjs/core'

@inject()
export default class ReviewService {
  /**
   * Create a new review
   */
  async create(reviewData: {
    comment: string
    rating: number
    spotId: number
    userId: number
  }) {
    try {
      // Check if user has already reviewed this spot
      const existingReview = await Review.query()
        .where('spotId', reviewData.spotId)
        .where('userId', reviewData.userId)
        .first()

      if (existingReview) {
        throw new Error('User has already reviewed this spot')
      }

      const review = await Review.create(reviewData)
      
      return review
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all reviews for a spot with pagination
   */
  async getBySpot(spotId: number, page: number = 1, limit: number = 20) {
    try {
      const reviews = await Review.query()
        .where('spotId', spotId)
        .preload('user', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return reviews
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific review by ID
   */
  async getById(id: number) {
    try {
      const review = await Review.query()
        .where('id', id)
        .preload('user', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .preload('spot')
        .firstOrFail()

      return review
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a review
   */
  async update(id: number, updateData: Partial<{
    comment: string
    rating: number
  }>, userId: number) {
    try {
      const review = await Review.query()
        .where('id', id)
        .where('userId', userId)
        .firstOrFail()

      review.merge(updateData)
      await review.save()
      
      return review
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a review
   */
  async delete(id: number, userId: number) {
    try {
      const review = await Review.query()
        .where('id', id)
        .where('userId', userId)
        .firstOrFail()

      await review.delete()
      
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Get reviews by user
   */
  async getByUser(userId: number, page: number = 1, limit: number = 20) {
    try {
      const reviews = await Review.query()
        .where('userId', userId)
        .preload('spot')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return reviews
    } catch (error) {
      throw error
    }
  }

  /**
   * Get recent reviews
   */
  async getRecent(limit: number = 10) {
    try {
      const reviews = await Review.query()
        .preload('user', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .preload('spot')
        .orderBy('createdAt', 'desc')
        .limit(limit)

      return reviews
    } catch (error) {
      throw error
    }
  }

  /**
   * Get reviews by rating
   */
  async getByRating(rating: number, page: number = 1, limit: number = 20) {
    try {
      const reviews = await Review.query()
        .where('rating', rating)
        .preload('user', (query) => {
          query.select('id', 'fullName', 'email')
        })
        .preload('spot')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return reviews
    } catch (error) {
      throw error
    }
  }

  /**
   * Get spot statistics
   */
  async getSpotStats(spotId: number) {
    try {
      const avgRatingResult = await Review.query()
        .where('spotId', spotId)
        .avg('rating as averageRating')
        .first()

      const reviewCountResult = await Review.query()
        .where('spotId', spotId)
        .count('* as total')
        .first()

      return {
        averageRating: Number(avgRatingResult?.$extras.averageRating) || 0,
        reviewCount: Number(reviewCountResult?.$extras.total) || 0
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Check if user can modify review
   */
  async canModify(reviewId: number, userId: number): Promise<boolean> {
    try {
      const review = await Review.findOrFail(reviewId)
      return review.userId === userId
    } catch (error) {
      return false
    }
  }
}
