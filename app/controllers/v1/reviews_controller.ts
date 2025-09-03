import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core' 
import ReviewService from '#services/review_service'
import { createReviewValidator, updateReviewValidator } from '#validators/review_validator'

@inject()
export default class ReviewsController {
  constructor(private reviewService: ReviewService) {}

  /**
   * List reviews for a specific spot
   */
  async index({ params, request, response }: HttpContext) {
    try {
      const { spotId } = params
      const spotIdNum = Number(spotId)
      
      if (isNaN(spotIdNum)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid spot ID'
        })
      }

      const query = request.qs()
      const { page = 1, limit = 20 } = query
      
      const reviews = await this.reviewService.getBySpot(
        spotIdNum,
        Number(page),
        Number(limit)
      )
      
      return response.status(200).json({
        success: true,
        data: reviews.toJSON().data,
        meta: reviews.toJSON().meta
      })
    } catch (error) {
      console.error('Error listing reviews:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve reviews'
      })
    }
  }

  /**
   * Create a new review for a spot
   */
  async store({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to create a review'
        })
      }

      const { spotId } = params
      const spotIdNum = Number(spotId)
      
      if (isNaN(spotIdNum)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid spot ID'
        })
      }

      const payload = await request.validateUsing(createReviewValidator)
      
      const reviewData = {
        comment: payload.comment,
        rating: payload.rating,
        spotId: spotIdNum,
        userId: user.id
      }

      const review = await this.reviewService.create(reviewData)
      
      // Load relationships for response
      await review.load('user', (query) => {
        query.select('id', 'username', 'email')
      })

      return response.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid review data provided',
          details: error.messages
        })
      }

      if (error.message === 'User has already reviewed this spot') {
        return response.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'You have already reviewed this spot'
        })
      }

      console.error('Error creating review:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create review'
      })
    }
  }

  /**
   * Show a specific review
   */
  async show({ params, response }: HttpContext) {
    try {
      const { spotId, id } = params
      const reviewId = Number(id)
      
      if (isNaN(reviewId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid review ID'
        })
      }

      const review = await this.reviewService.getById(reviewId)
      
      // Verify the review belongs to the specified spot
      if (review.spotId !== Number(spotId)) {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Review not found for this spot'
        })
      }

      return response.status(200).json({
        success: true,
        data: review
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Review not found'
        })
      }

      console.error('Error retrieving review:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve review'
      })
    }
  }

  /**
   * Update a review
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to update a review'
        })
      }

      const { id } = params
      const reviewId = Number(id)
      
      if (isNaN(reviewId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid review ID'
        })
      }

      // Check if user can modify this review
      const canModify = await this.reviewService.canModify(reviewId, user.id)
      if (!canModify) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own reviews'
        })
      }

      const payload = await request.validateUsing(updateReviewValidator)
      
      const updatedReview = await this.reviewService.update(reviewId, payload, user.id)
      
      // Load relationships for response
      await updatedReview.load('user', (query) => {
        query.select('id', 'username', 'email')
      })

      return response.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: updatedReview
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid review data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Review not found'
        })
      }

      console.error('Error updating review:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update review'
      })
    }
  }

  /**
   * Delete a review
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to delete a review'
        })
      }

      const { id } = params
      const reviewId = Number(id)
      
      if (isNaN(reviewId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid review ID'
        })
      }

      // Check if user can modify this review
      const canModify = await this.reviewService.canModify(reviewId, user.id)
      if (!canModify) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only delete your own reviews'
        })
      }

      await this.reviewService.delete(reviewId, user.id)

      return response.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Review not found'
        })
      }

      console.error('Error deleting review:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete review'
      })
    }
  }

  /**
   * Get recent reviews
   */
  async recent({ request, response }: HttpContext) {
    try {
      const query = request.qs()
      const { limit = 10 } = query
      
      const reviews = await this.reviewService.getRecent(Number(limit))
      
      return response.status(200).json({
        success: true,
        data: reviews
      })
    } catch (error) {
      console.error('Error getting recent reviews:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve recent reviews'
      })
    }
  }

  /**
   * Get reviews by rating
   */
  async byRating({ request, response }: HttpContext) {
    try {
      const query = request.qs()
      const { rating, page = 1, limit = 20 } = query
      
      if (!rating || isNaN(Number(rating))) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Rating parameter is required and must be a number'
        })
      }

      const reviews = await this.reviewService.getByRating(
        Number(rating),
        Number(page),
        Number(limit)
      )
      
      return response.status(200).json({
        success: true,
        data: reviews.toJSON().data,
        meta: reviews.toJSON().meta
      })
    } catch (error) {
      console.error('Error getting reviews by rating:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve reviews by rating'
      })
    }
  }
}
