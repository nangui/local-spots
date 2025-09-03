import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class InvalidCredentialsException extends Exception {
  static status = 401
  static code = 'E_INVALID_CREDENTIALS'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    })
  }
}