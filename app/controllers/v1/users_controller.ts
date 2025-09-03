import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'
import { updateProfileValidator, changePasswordValidator } from '#validators/user_validator'
import { inject } from '@adonisjs/core'

@inject()
export default class UsersController {
  constructor(private userService: UserService) {}

  /**
   * Show user profile
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only view their own profile
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own profile'
        })
      }

      const userProfile = await this.userService.getById(userId)
      
      return response.status(200).json({
        success: true,
        data: userProfile
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found'
        })
      }

      console.error('Error retrieving user profile:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user profile'
      })
    }
  }

  /**
   * Update user profile
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only update their own profile
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own profile'
        })
      }

      const payload = await request.validateUsing(updateProfileValidator)
      
      const updatedUser = await this.userService.updateProfile(userId, payload)
      
      return response.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid profile data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found'
        })
      }

      console.error('Error updating user profile:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user profile'
      })
    }
  }

  /**
   * Change user password
   */
  async changePassword({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only change their own password
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only change your own password'
        })
      }

      const payload = await request.validateUsing(changePasswordValidator)
      
      await this.userService.changePassword(
        userId,
        payload.currentPassword,
        payload.newPassword
      )
      
      return response.status(200).json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid password data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found'
        })
      }

      if (error.message === 'Current password is incorrect') {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Current password is incorrect'
        })
      }

      console.error('Error changing password:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to change password'
      })
    }
  }

  /**
   * Get user spots
   */
  async spots({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only view their own spots
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own spots'
        })
      }

      const query = request.qs()
      const { page = 1, limit = 20 } = query
      
      const spots = await this.userService.getUserSpots(
        userId,
        Number(page),
        Number(limit)
      )
      
      return response.status(200).json({
        success: true,
        data: spots.toJSON().data,
        meta: spots.toJSON().meta
      })
    } catch (error) {
      console.error('Error retrieving user spots:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user spots'
      })
    }
  }

  /**
   * Get user reviews
   */
  async reviews({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only view their own reviews
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own reviews'
        })
      }

      const query = request.qs()
      const { page = 1, limit = 20 } = query
      
      const reviews = await this.userService.getUserReviews(
        userId,
        Number(page),
        Number(limit)
      )
      
      return response.status(200).json({
        success: true,
        data: reviews.toJSON().data,
        meta: reviews.toJSON().meta
      })
    } catch (error) {
      console.error('Error retrieving user reviews:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user reviews'
      })
    }
  }

  /**
   * Get user statistics
   */
  async stats({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const { id } = params
      const userId = Number(id)
      
      if (isNaN(userId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid user ID'
        })
      }

      // Users can only view their own statistics
      if (userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own statistics'
        })
      }

      const stats = await this.userService.getUserStats(userId)
      
      return response.status(200).json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error retrieving user statistics:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user statistics'
      })
    }
  }

  /**
   * Get current user profile (alias for /users/:id)
   */
  async profile({ response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const userProfile = await this.userService.getById(user.id)
      
      return response.status(200).json({
        success: true,
        data: userProfile
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found'
        })
      }

      console.error('Error retrieving user profile:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve user profile'
      })
    }
  }

  /**
   * Update current user profile (alias for /users/:id)
   */
  async updateProfile({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated'
        })
      }

      const payload = await request.validateUsing(updateProfileValidator)
      
      const updatedUser = await this.userService.updateProfile(user.id, payload)
      
      return response.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid profile data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'User not found'
        })
      }

      console.error('Error updating user profile:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user profile'
      })
    }
  }
}
