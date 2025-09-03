import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle validation errors from VineJS
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid data provided',
        details: error.messages
      })
    }

    // Let custom exceptions handle themselves
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  /**
   * Add custom context to log messages
   */
  protected context(ctx: HttpContext) {
    return {
      requestId: ctx.request.id(),
      userId: ctx.auth.user?.id,
      ip: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
      url: ctx.request.url(),
      method: ctx.request.method(),
    }
  }

  /**
   * Ignore certain status codes from being reported
   */
  protected ignoreStatuses = [
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
    422, // Validation Error
  ]
}
