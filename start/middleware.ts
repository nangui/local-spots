// Import named middlewares
import auth from '#middleware/auth_middleware'
import guest from '#middleware/guest_middleware'

// Export middleware functions for use in routes
export const authMiddleware = auth
export const guestMiddleware = guest

// Note: Rate limiting is now handled by @adonisjs/limiter
// See start/limiter.ts for throttle middleware definitions
