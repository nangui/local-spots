import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AuthService from '#services/auth_service'
import MailService from '#services/mail_service'

@inject()
export default class AuthController {
  constructor(private authService: AuthService, private mailService: MailService) {}

  /**
   * Register a new user
   */
  async register({ request, response, auth }: HttpContext) {
    try {
      const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

      if (!email || !password || !fullName) {
        return response.status(400).json({
          error: 'Missing required fields',
          message: 'Email, password, and fullName are required'
        })
      }

      if (password.length < 8) {
        return response.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 8 characters long'
        })
      }

      const user = await this.authService.register({ email, password, fullName })

      // Send welcome email
      await this.mailService.sendWelcomeEmail(user)

      // Generate token for the user
      const token = await auth.use('api').createToken(user)

      return response.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token: token
      })
    } catch (error) {
      // Let the exception handler deal with custom exceptions
      throw error
    }
  }

  /**
   * Login user
   */
  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Validate required fields
      if (!email || !password) {
        return response.status(400).json({
          error: 'Missing required fields',
          message: 'Email and password are required'
        })
      }

      // Verify credentials using service
      const user = await this.authService.verifyCredentials(email, password)
      if (!user) {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials'
        })
      }

      // Generate token for the user
      const token = await auth.use('api').createToken(user)

      return response.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token: token
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Refresh access token
   */
  async refresh({ response, auth }: HttpContext) {
    try {
      // User is already authenticated by middleware
      const user = auth.user!

      // Generate new token for the user
      const token = await auth.use('api').createToken(user)

      return response.status(200).json({
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token: token
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Logout user
   */
  async logout({ response, auth }: HttpContext) {
    try {
      // User is already authenticated by middleware
      // Revoke current token
      await auth.use('api').invalidateToken()

      return response.status(200).json({
        message: 'Logout successful'
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }

  /**
   * Change password
   */
  async changePassword({ request, response, auth }: HttpContext) {
    try {
      // User is already authenticated by middleware
      const user = auth.user!

      const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return response.status(400).json({
          error: 'Missing required fields',
          message: 'Current password and new password are required'
        })
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return response.status(400).json({
          error: 'Invalid password',
          message: 'New password must be at least 8 characters long'
        })
      }

      // Verify current password
      const isValidPassword = await this.authService.verifyCredentials(user.email, currentPassword)
      if (!isValidPassword) {
        return response.status(400).json({
          error: 'Invalid password',
          message: 'Current password is incorrect'
        })
      }

      // Update password with automatic re-hashing
      await this.authService.updatePassword(user, newPassword)

      return response.status(200).json({
        message: 'Password changed successfully'
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
