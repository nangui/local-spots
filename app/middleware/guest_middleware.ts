import { HttpContext } from '@adonisjs/core/http'

/**
 * Guest middleware is used to redirect authenticated users
 * away from routes that should only be accessible to guests.
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to, when user is authenticated
   */
  redirectTo = '/dashboard'

  async handle(ctx: HttpContext, next: () => Promise<void>) {
    // Check if user is already authenticated
    if (ctx.auth.isAuthenticated) {
      // If authenticated, redirect to dashboard
      return ctx.response.redirect('/dashboard')
    }

    // If not authenticated, continue to the next middleware/route
    await next()
  }
}
