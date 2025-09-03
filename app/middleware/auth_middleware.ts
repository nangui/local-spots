import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn
  ) {
    try {
      await ctx.auth.authenticate()
      return next()
    } catch (error) {
      // For API responses, return JSON error instead of redirect
      try {
        return ctx.response.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      } catch (responseError) {
        // Fallback for test environment or when response methods are not available
        return {
          error: 'Unauthorized',
          message: 'Authentication required'
        }
      }
    }
  }
}