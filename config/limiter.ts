import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE', 'memory'),

  stores: {
    /**
     * Database store to save rate limiting data inside a
     * MYSQL or PostgreSQL database.
     * Good for development and small to medium applications
     */
    database: stores.database({
      tableName: 'rate_limits'
    }),
    
    /**
     * Memory store for testing and development
     * Not recommended for production
     */
    memory: stores.memory({})
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}