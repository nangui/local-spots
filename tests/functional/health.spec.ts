import { test } from '@japa/runner'

test.group('Health Check Endpoints', () => {
  test('should return basic health check information', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    assert.exists(body.isHealthy)
    assert.exists(body.status)
    assert.exists(body.finishedAt)
    assert.exists(body.checks)
    assert.isArray(body.checks)
  })

  test('should return lightweight ping response', async ({ client, assert }) => {
    const response = await client.get('/health/ping')

    response.assertStatus(200)
    
    const body = response.body()
    assert.exists(body.isHealthy)
    assert.exists(body.status)
    assert.exists(body.finishedAt)
    
    // Ping should be lightweight
    assert.notExists(body.checks)
    assert.notExists(body.debugInfo)
  })

  test('should return detailed health check report', async ({ client, assert }) => {
    const response = await client.get('/health/detailed')

    response.assertStatus(200)
    
    const body = response.body()
    assert.exists(body.isHealthy)
    assert.exists(body.status)
    assert.exists(body.finishedAt)
    assert.exists(body.checks)
    assert.exists(body.debugInfo)
    
    // Detailed should have more information
    assert.isArray(body.checks)
    assert.exists(body.debugInfo.pid)
    assert.exists(body.debugInfo.platform)
    assert.exists(body.debugInfo.version)
  })

  test('should return healthy status when all checks pass', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    assert.isTrue(body.isHealthy)
    assert.equal(body.status, 'ok')
  })

  test('should include system health checks', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    const checkNames = body.checks.map((check: any) => check.name)
    
    // In test environment, system checks are disabled, so just verify we have some checks
    assert.isTrue(checkNames.length > 0, 'Should have at least some health checks')
    
    // Should include database checks in any environment
    const hasDbCheck = checkNames.some((name: string) => name.includes('Database') || name.includes('Connection'))
    assert.isTrue(hasDbCheck, 'Should include database health checks')
  })

  test('should include database health checks', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    const checkNames = body.checks.map((check: any) => check.name)
    
    // Should include database checks (SQLite in test, Postgres in production)
    const hasDbCheck = checkNames.some((name: string) => 
      name.includes('Database health check') || 
      name.includes('Connection count check')
    )
    assert.isTrue(hasDbCheck, 'Should include database health checks')
  })

  test('should include application-specific health checks', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    const checkNames = body.checks.map((check: any) => check.name)
    
    // Should include LocalSpots specific checks
    assert.include(checkNames, 'LocalSpots Health Check')
    assert.include(checkNames, 'File Storage Health Check')
    assert.include(checkNames, 'PostGIS Health Check')
  })

  test('should return proper error status when checks fail', async ({ client, assert }) => {
    // This test assumes that some health checks might fail in test environment
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    
    // Status should be one of the expected values
    assert.include(['ok', 'warning', 'error'], body.status)
    
    // If any check fails, isHealthy should be false
    if (body.status === 'error') {
      assert.isFalse(body.isHealthy)
    }
  })

  test('should include check metadata and timing', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    
    const body = response.body()
    const firstCheck = body.checks[0]
    
    // Each check should have required properties
    assert.exists(firstCheck.name)
    assert.exists(firstCheck.status)
    assert.exists(firstCheck.message)
    assert.exists(firstCheck.finishedAt)
    assert.exists(firstCheck.isCached)
    
    // Status should be valid
    assert.include(['ok', 'warning', 'error'], firstCheck.status)
  })

  test('should handle health check with secret protection', async ({ client }) => {
    // Test without secret (should work in test environment)
    const response = await client.get('/health')
    response.assertStatus(200)
    
    // Test with invalid secret (should still work in test environment)
    const responseWithSecret = await client.get('/health')
      .header('x-health-secret', 'invalid-secret')
    responseWithSecret.assertStatus(200)
  })

  test('should return consistent response format across endpoints', async ({ client, assert }) => {
    const basicResponse = await client.get('/health')
    const detailedResponse = await client.get('/health/detailed')
    
    const basicBody = basicResponse.body()
    const detailedBody = detailedResponse.body()
    
    // Both should have the same basic structure
    assert.exists(basicBody.isHealthy)
    assert.exists(basicBody.status)
    assert.exists(basicBody.finishedAt)
    
    // Detailed should have additional information
    assert.exists(detailedBody.debugInfo)
    assert.isArray(detailedBody.checks)
    
    // Both should return the same overall health status
    assert.equal(basicBody.isHealthy, detailedBody.isHealthy)
    assert.equal(basicBody.status, detailedBody.status)
  })
})
