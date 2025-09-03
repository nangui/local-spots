import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('NODE_ENV') === 'test' ? 'sqlite' : 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        // PostGIS specific settings
        ssl: env.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      // PostGIS optimization settings
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
    },
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('DB_DATABASE', ':memory:'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      useNullAsDefault: true,
    },
  },
})

export default dbConfig