import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class DuplicateEmailException extends Exception {
  static status = 409
  static code = 'E_DUPLICATE_ENTRY'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      error: 'Conflict',
      message: 'User with this email already exists'
    })
  }
}