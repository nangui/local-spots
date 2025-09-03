import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import DuplicateEmailException from '#exceptions/duplicate_email_exception'
import InvalidCredentialsException from '#exceptions/invalid_credentials_exception'

@inject()
export default class AuthService {
  /**
   * Register a new user
   */
  async register(userData: {
    email: string
    password: string
    fullName: string
  }) {
    try {
      // Check if user already exists
      const existingUser = await User.findBy('email', userData.email)
      if (existingUser) {
        throw new DuplicateEmailException('User with this email already exists')
      }

      // Create user with plain text password - model hook will hash it
      const user = await User.create({
        email: userData.email,
        password: userData.password, // Plain text - hook will hash
        fullName: userData.fullName,
      })

      return user
    } catch (error) {
      // If it's a database constraint error, convert to our custom exception
      if (error.code === '23505' || error.code === 'E_DUPLICATE_ENTRY') {
        throw new DuplicateEmailException('User with this email already exists')
      }
      
      // For other errors, check if it's a duplicate entry from the database
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        throw new DuplicateEmailException('User with this email already exists')
      }
      
      throw error
    }
  }

  /**
   * Login user with automatic password re-hashing
   */
  async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await User.findBy('email', email)
      if (!user) {
        throw new InvalidCredentialsException('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await hash.verify(user.password, password)
      if (!isValidPassword) {
        throw new InvalidCredentialsException('Invalid credentials')
      }

      // Check if password needs re-hashing and update if necessary
      await this.checkAndRehashPassword(user, password)

      return user
    } catch (error) {
      throw error
    }
  }

  /**
   * Verify user credentials with automatic password re-hashing
   */
  async verifyCredentials(email: string, password: string) {
    try {
      // Find user by email
      const user = await User.findBy('email', email)
      if (!user) {
        return null
      }

      // Verify password
      const isValidPassword = await hash.verify(user.password, password)
      if (!isValidPassword) {
        return null
      }

      // Check if password needs re-hashing and update if necessary
      await this.checkAndRehashPassword(user, password)

      return user
    } catch (error) {
      return null
    }
  }

  /**
   * Check if password needs re-hashing and update if necessary
   * This ensures passwords always use the latest hashing algorithm
   */
  private async checkAndRehashPassword(user: User, plainTextPassword: string) {
    try {
      // Check if the current password hash uses outdated options
      if (await hash.needsReHash(user.password)) {
        console.log(`Password for user ${user.email} needs re-hashing`)
        
        // Update the password with plain text - model hook will hash it
        user.password = plainTextPassword
        await user.save()
        
        console.log(`Password for user ${user.email} has been re-hashed`)
      }
    } catch (error) {
      console.error(`Error re-hashing password for user ${user.email}:`, error)
      // Don't throw error - this is not critical for login
    }
  }

  /**
   * Update user password with automatic hashing
   */
  async updatePassword(user: User, newPassword: string) {
    try {
      // Update password with plain text - model hook will hash it
      user.password = newPassword
      await user.save()
      
      return user
    } catch (error) {
      throw error
    }
  }
}
