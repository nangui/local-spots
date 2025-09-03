import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

export default defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('DB_DATABASE', 'database/test.sqlite3'),
      },
      useNullAsDefault: true,
      debug: false,
    },
  },
})
