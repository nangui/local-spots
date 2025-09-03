import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck, MemoryRSSCheck } from '@adonisjs/core/health'
import db from '@adonisjs/lucid/services/db'
import { DbCheck, DbConnectionCountCheck } from '@adonisjs/lucid/database'
import { LocalSpotsHealthCheck } from '#health_checks/local_spots_health_check'
import { FileStorageHealthCheck } from '#health_checks/file_storage_health_check'
import { PostGISHealthCheck } from '#health_checks/postgis_health_check'
import env from '#start/env'

// Get health checks based on environment
const isTestEnvironment = env.get('NODE_ENV') === 'test'

export const healthChecks = new HealthChecks().register([
  // Database health checks (always include)
  new DbCheck(db.connection())
    .cacheFor('30 seconds'), // Cache for 30 seconds
  
  new DbConnectionCountCheck(db.connection())
    .warnWhenExceeds(8) // Warning at 8 connections
    .failWhenExceeds(12), // Fail at 12 connections
  
  // Custom LocalSpots health checks (always include)
  new LocalSpotsHealthCheck()
    .cacheFor('1 minute'), // Cache for 1 minute
  
  new FileStorageHealthCheck()
    .cacheFor('2 minutes'), // Cache for 2 minutes
  
  new PostGISHealthCheck()
    .cacheFor('1 minute'), // Cache for 1 minute
  
  // System health checks (only in non-test environments)
  ...(isTestEnvironment ? [] : [
    new DiskSpaceCheck()
      .warnWhenExceeds(80) // Warning at 80% disk usage
      .failWhenExceeds(90), // Fail at 90% disk usage
    
    new MemoryHeapCheck()
      .warnWhenExceeds('300 mb') // Warning at 300MB
      .failWhenExceeds('700 mb'), // Fail at 700MB
    
    new MemoryRSSCheck()
      .warnWhenExceeds('600 mb') // Warning at 600MB
      .failWhenExceeds('800 mb'), // Fail at 800MB
  ])
])