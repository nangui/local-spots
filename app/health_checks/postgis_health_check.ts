import { Result, BaseCheck } from '@adonisjs/core/health'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

export class PostGISHealthCheck extends BaseCheck {
  name = 'PostGIS Health Check'

  async run() {
    try {
      // Check if we're in a test environment or using SQLite
      const connection = db.connection()
      const clientName = connection.getReadClient().client
      
      // If using SQLite, return a warning that PostGIS is not available
      if (clientName === 'sqlite3') {
        return Result.warning(
          'PostGIS is not available in SQLite. This is expected in test environments.'
        )
      }

      // Check if PostGIS extension is available (PostgreSQL only)
      const postgisCheck = await db.rawQuery(`
        SELECT 
          name, 
          default_version, 
          installed_version 
        FROM pg_available_extensions 
        WHERE name = 'postgis'
      `)

      if (!postgisCheck.rows || postgisCheck.rows.length === 0) {
        return Result.failed(
          'PostGIS extension is not available in this PostgreSQL installation'
        )
      }

      const postgisInfo = postgisCheck.rows[0]
      
      if (!postgisInfo.installed_version) {
        return Result.failed(
          'PostGIS extension is not installed in the database'
        )
      }

      // Check if PostGIS extension is enabled
      const enabledCheck = await db.rawQuery(`
        SELECT 
          extname, 
          extversion 
        FROM pg_extension 
        WHERE extname = 'postgis'
      `)

      if (!enabledCheck.rows || enabledCheck.rows.length === 0) {
        return Result.failed(
          'PostGIS extension is not enabled in the database'
        )
      }

      // Test basic PostGIS functionality
      const spatialTest = await db.rawQuery(`
        SELECT 
          PostGIS_Version() as version,
          ST_AsText(ST_GeomFromText('POINT(0 0)')) as test_point,
          ST_Distance(
            ST_GeomFromText('POINT(0 0)'),
            ST_GeomFromText('POINT(1 1)')
          ) as test_distance
      `)

      if (!spatialTest.rows || spatialTest.rows.length === 0) {
        return Result.failed(
          'PostGIS spatial functions are not working properly'
        )
      }

      const spatialInfo = spatialTest.rows[0]
      
      // Check if we have the expected PostGIS version
      const version = spatialInfo.version
      const majorVersion = version ? version.split('.')[0] : '0'
      
      if (parseInt(majorVersion) < 3) {
        return Result.warning(
          `PostGIS version ${version} is older than recommended version 3.x`
        )
      }

      return Result.ok('PostGIS is healthy and fully functional')
    } catch (error) {
      // In test environments, return warning instead of failure
      if (env.get('NODE_ENV') === 'test') {
        return Result.warning(
          'PostGIS health check failed in test environment. This is expected.'
        )
      }
      
      return Result.failed(
        'Failed to perform PostGIS health check'
      )
    }
  }
}
