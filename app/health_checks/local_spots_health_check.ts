import { Result, BaseCheck } from '@adonisjs/core/health'
import env from '#start/env'

export class LocalSpotsHealthCheck extends BaseCheck {
  name = 'LocalSpots Health Check'

  async run() {
    try {
      // Check if essential environment variables are set
      const requiredEnvVars = [
        'APP_KEY',
        'DB_CONNECTION',
        'DB_HOST',
        'DB_PORT',
        'DB_USER',
        'DB_NAME'
      ]

      const missingVars = requiredEnvVars.filter(varName => !env.get(varName))
      
      if (missingVars.length > 0) {
        return Result.failed(
          `Missing required environment variables: ${missingVars.join(', ')}`
        )
      }

      // Check if APP_KEY has minimum length
      const appKey = env.get('APP_KEY')
      if (appKey && appKey.length < 32) {
        return Result.warning(
          'APP_KEY is shorter than recommended 32 characters'
        )
      }

      // Check if we're in production mode
      const nodeEnv = env.get('NODE_ENV', 'development')
      if (nodeEnv === 'production') {
        // Additional production checks
        if (!env.get('DB_PASSWORD')) {
          return Result.warning(
            'Database password not set in production environment'
          )
        }
      }

      return Result.ok('LocalSpots application configuration is healthy')

    } catch (error) {
      return Result.failed(
        'Failed to perform LocalSpots health check'
      )
    }
  }
}
