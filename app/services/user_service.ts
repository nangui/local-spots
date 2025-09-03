import User from '#models/user'
import Spot from '#models/spot'
import Review from '#models/review'
import hash from '@adonisjs/core/services/hash'
import { inject } from '@adonisjs/core'

@inject()
export default class UserService {
  /**
   * Get user by ID
   */
  async getById(id: number) {
    try {
      const user = await User.findOrFail(id)
      return user
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string) {
    try {
      const user = await User.query()
        .where('email', email)
        .first()

      return user
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new user
   */
  async create(userData: {
    fullName: string
    email: string
    password: string
  }) {
    try {
      // Check if user with same email already exists
      const existingUserByEmail = await this.getByEmail(userData.email)
      if (existingUserByEmail) {
        throw new Error('User with this email already exists')
      }

      const user = await User.create(userData)
      return user
    } catch (error) {
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: number, updateData: Partial<{
    fullName: string
  }>) {
    try {
      const user = await User.findOrFail(id)
      
      user.merge(updateData)
      await user.save()
      
      return user
    } catch (error) {
      throw error
    }
  }

  /**
   * Change user password
   */
  async changePassword(id: number, currentPassword: string, newPassword: string) {
    try {
      const user = await User.findOrFail(id)
      
      // Verify current password
      const isValidPassword = await hash.verify(user.password, currentPassword)
      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedPassword = await hash.make(newPassword)
      
      user.password = hashedPassword
      await user.save()
      
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user spots
   */
  async getUserSpots(userId: number, page: number = 1, limit: number = 20) {
    try {
      const spots = await Spot.query()
        .where('userId', userId)
        .preload('category')
        .preload('photos')
        .preload('reviews')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return spots
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user reviews
   */
  async getUserReviews(userId: number, page: number = 1, limit: number = 20) {
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
   * Get user statistics
   */
  async getUserStats(userId: number) {
    try {
      const spotCount = await Spot.query()
        .where('userId', userId)
        .count('* as total')
        .first()

      const reviewCount = await Review.query()
        .where('userId', userId)
        .count('* as total')
        .first()

      const avgRating = await Review.query()
        .where('userId', userId)
        .avg('rating as averageRating')
        .first()

      return {
        spotCount: Number(spotCount?.$extras.total) || 0,
        reviewCount: Number(reviewCount?.$extras.total) || 0,
        averageRating: Number(avgRating?.$extras.averageRating) || 0
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Search users
   */
  async search(searchTerm: string, page: number = 1, limit: number = 20) {
    try {
      const users = await User.query()
        .whereILike('fullName', `%${searchTerm}%`)
        .orWhereILike('email', `%${searchTerm}%`)
        .orderBy('fullName', 'asc')
        .paginate(page, limit)

      return users
    } catch (error) {
      throw error
    }
  }
}
