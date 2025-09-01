# Testing Guide

## 🧪 Complete Testing Guide

This guide covers all aspects of testing in the Local Spots application, including unit, functional, and integration tests.

## 📋 Table of Contents

- [Configuration](#configuration)
- [Test Types](#test-types)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Mocking and Stubs](#mocking-and-stubs)
- [Test Database](#test-database)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## ⚙️ Configuration

### Installing Test Dependencies

```bash
npm install --save-dev @japa/runner @japa/assert @japa/api-client
```

### Japa Configuration

```typescript
// tests/bootstrap.ts
import { configure } from '@japa/runner'
import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'

configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [
    assert(),
    apiClient(),
    pluginAdonisJS(app)
  ],
  reporters: ['spec'],
  importer: (filePath) => import(filePath),
})
```

## 🎯 Test Types

### 1. Unit Tests

Isolated tests of individual functions, classes, or modules.

```typescript
// tests/unit/services/spot_service.spec.ts
import { test } from '@japa/runner'
import SpotService from '#services/spot_service'

test.group('SpotService', () => {
  test('calculate distance between two points', ({ assert }) => {
    const distance = SpotService.calculateDistance(
      48.8566, 2.3522,  // Paris
      51.5074, -0.1278  // London
    )
    
    assert.closeTo(distance, 344, 1)
  })

  test('validate coordinates', ({ assert }) => {
    assert.isTrue(SpotService.isValidLatitude(45.5))
    assert.isFalse(SpotService.isValidLatitude(91))
    assert.isTrue(SpotService.isValidLongitude(-120))
    assert.isFalse(SpotService.isValidLongitude(181))
  })
})
```

### 2. Functional Tests

Tests of API endpoints and complete workflows.

```typescript
// tests/functional/spots.spec.ts
import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'

test.group('Spots API', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /spots returns paginated list', async ({ client }) => {
    // Create test data
    await SpotFactory.createMany(15)

    const response = await client.get('/api/spots?page=1&limit=10')

    response.assertStatus(200)
    response.assertBodyContains({
      meta: {
        total: 15,
        per_page: 10,
        current_page: 1
      }
    })
    assert.lengthOf(response.body().data, 10)
  })

  test('POST /spots requires authentication', async ({ client }) => {
    const response = await client.post('/api/spots').json({
      name: 'Test Spot',
      latitude: 48.8566,
      longitude: 2.3522
    })

    response.assertStatus(401)
    response.assertBodyContains({
      errors: [{ message: 'Unauthorized' }]
    })
  })

  test('POST /spots creates new spot for authenticated user', async ({ client }) => {
    const user = await UserFactory.create()
    
    const response = await client
      .post('/api/spots')
      .loginAs(user)
      .json({
        name: 'New Coffee Shop',
        description: 'Best coffee in town',
        latitude: 48.8566,
        longitude: 2.3522,
        category: 'cafe'
      })

    response.assertStatus(201)
    response.assertBodyContains({
      name: 'New Coffee Shop',
      user_id: user.id
    })

    // Verify in database
    const spot = await Spot.findBy('name', 'New Coffee Shop')
    assert.isNotNull(spot)
    assert.equal(spot!.userId, user.id)
  })
})
```

### 3. Integration Tests

Tests of interaction between multiple components.

```typescript
// tests/integration/spot_creation_workflow.spec.ts
import { test } from '@japa/runner'
import Event from '@adonisjs/core/services/event'

test.group('Spot Creation Workflow', () => {
  test('creating spot triggers notification events', async ({ assert }) => {
    const eventSpy = sinon.spy()
    Event.on('spot:created', eventSpy)

    const user = await UserFactory.create()
    const spot = await SpotService.create(user, {
      name: 'Test Spot',
      latitude: 48.8566,
      longitude: 2.3522,
      category: 'restaurant'
    })

    assert.isTrue(eventSpy.calledOnce)
    assert.equal(eventSpy.firstCall.args[0].id, spot.id)
  })

  test('spot creation updates user statistics', async ({ assert }) => {
    const user = await UserFactory.create()
    const initialCount = user.spotsCount

    await SpotService.create(user, {
      name: 'Test Spot',
      latitude: 48.8566,
      longitude: 2.3522,
      category: 'cafe'
    })

    await user.refresh()
    assert.equal(user.spotsCount, initialCount + 1)
  })
})
```

## 📁 Test Structure

```
tests/
├── unit/
│   ├── models/
│   │   ├── spot.spec.ts
│   │   └── user.spec.ts
│   ├── services/
│   │   ├── spot_service.spec.ts
│   │   └── geocoding_service.spec.ts
│   └── helpers/
│       └── string_helper.spec.ts
├── functional/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── spots/
│   │   ├── create.spec.ts
│   │   ├── update.spec.ts
│   │   └── delete.spec.ts
│   └── reviews/
│       └── crud.spec.ts
├── integration/
│   └── workflows/
│       └── spot_lifecycle.spec.ts
├── fixtures/
│   ├── spots.json
│   └── users.json
└── factories/
    ├── spot_factory.ts
    └── user_factory.ts
```

## ✍️ Writing Tests

### Factories for Test Data

```typescript
// tests/factories/spot_factory.ts
import Factory from '@adonisjs/lucid/factories'
import Spot from '#models/spot'

export const SpotFactory = Factory
  .define(Spot, ({ faker }) => ({
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    category: faker.helpers.arrayElement(['restaurant', 'cafe', 'bar', 'park']),
    address: faker.location.streetAddress()
  }))
  .relation('user', () => UserFactory)
  .relation('reviews', () => ReviewFactory)
  .build()
```

### Tests with Relations

```typescript
test('spot with reviews', async ({ assert }) => {
  const spot = await SpotFactory
    .with('reviews', 3)
    .create()

  await spot.load('reviews')
  assert.lengthOf(spot.reviews, 3)
})
```

### Validation Tests

```typescript
test('validation errors for invalid data', async ({ client }) => {
  const user = await UserFactory.create()
  
  const response = await client
    .post('/api/spots')
    .loginAs(user)
    .json({
      name: 'A',  // Too short
      latitude: 91,  // Invalid
      longitude: 181  // Invalid
    })

  response.assertStatus(422)
  response.assertBodyContains({
    errors: [
      {
        field: 'name',
        rule: 'minLength',
        message: 'The name field must be at least 3 characters'
      },
      {
        field: 'latitude',
        rule: 'range',
        message: 'The latitude field must be between -90 and 90'
      }
    ]
  })
})
```

## 🎭 Mocking and Stubs

### Mocking External Services

```typescript
// tests/mocks/geocoding_service_mock.ts
import sinon from 'sinon'
import GeocodingService from '#services/geocoding_service'

export function mockGeocodingService() {
  const stub = sinon.stub(GeocodingService, 'getCoordinates')
  
  stub.withArgs('Paris, France').resolves({
    latitude: 48.8566,
    longitude: 2.3522
  })
  
  stub.withArgs('Invalid Address').rejects(
    new Error('Address not found')
  )
  
  return stub
}
```

### Using Mocks

```typescript
test('geocode address when creating spot', async ({ client }) => {
  const geoStub = mockGeocodingService()
  
  try {
    const response = await client
      .post('/api/spots')
      .json({
        name: 'Test Spot',
        address: 'Paris, France'
      })

    response.assertBodyContains({
      latitude: 48.8566,
      longitude: 2.3522
    })
    
    assert.isTrue(geoStub.calledOnce)
  } finally {
    geoStub.restore()
  }
})
```

## 🗄️ Test Database

### Configuration

```typescript
// .env.test
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=local_spots_test
```

### Transactions for Isolation

```typescript
test.group('Spots', (group) => {
  // Start transaction before each test
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('creates spot', async () => {
    // Test runs in transaction
    // that will be rolled back after
  })
})
```

### Test Seeders

```typescript
// tests/seeders/test_seeder.ts
export default class TestSeeder {
  async run() {
    // Create base data for tests
    await User.createMany([
      { email: 'admin@test.com', role: 'admin' },
      { email: 'user@test.com', role: 'user' }
    ])

    await Category.createMany([
      { name: 'Restaurant', slug: 'restaurant' },
      { name: 'Café', slug: 'cafe' }
    ])
  }
}
```

## 📊 Coverage

### Coverage Configuration

```json
// package.json
{
  "scripts": {
    "test:coverage": "c8 npm test",
    "test:coverage:html": "c8 --reporter=html npm test"
  }
}
```

### c8 Configuration

```json
// .c8rc.json
{
  "all": true,
  "include": ["app/**/*.ts"],
  "exclude": [
    "app/**/*.spec.ts",
    "app/**/types.ts",
    "app/**/contracts/**"
  ],
  "reporter": ["text", "lcov", "html"],
  "statements": 80,
  "branches": 75,
  "functions": 80,
  "lines": 80
}
```

### Generate Coverage Report

```bash
# Generate report
npm run test:coverage

# View HTML report
npm run test:coverage:html
open coverage/index.html
```

## 📝 Best Practices

### 1. Test Naming

```typescript
// ✅ Good - Descriptive and clear
test('returns 404 when spot does not exist')
test('allows owner to update their spot')
test('prevents non-owner from deleting spot')

// ❌ Bad - Vague or unclear
test('test spot')
test('works correctly')
test('handles error')
```

### 2. AAA Structure (Arrange, Act, Assert)

```typescript
test('calculate spot rating average', ({ assert }) => {
  // Arrange
  const reviews = [
    { rating: 5 },
    { rating: 4 },
    { rating: 3 }
  ]

  // Act
  const average = calculateAverage(reviews)

  // Assert
  assert.equal(average, 4)
})
```

### 3. One Concept Per Test

```typescript
// ✅ Good - Separate tests
test('validates required fields')
test('validates email format')
test('validates password strength')

// ❌ Bad - Too many verifications
test('validates all user inputs')
```

### 4. Independent Tests

```typescript
// ✅ Good - Creates own data
test('updates spot name', async () => {
  const spot = await SpotFactory.create({ name: 'Old Name' })
  await spot.merge({ name: 'New Name' }).save()
  assert.equal(spot.name, 'New Name')
})

// ❌ Bad - Depends on external state
test('updates the first spot', async () => {
  const spot = await Spot.first()  // Depends on existing data
  // ...
})
```

### 5. Explicit Test Data

```typescript
// ✅ Good - Explicit values for test
const user = await UserFactory.create({
  email: 'test@example.com',
  isVerified: false
})

// ❌ Bad - Magic values not explained
const user = await UserFactory.create()
user.status = 2  // What does 2 mean?
```

## 🚀 Useful Commands

```bash
# Run all tests
npm test

# Run specific group
node ace test functional

# Run specific file
node ace test tests/functional/spots.spec.ts

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Parallel tests
node ace test --parallel

# Tests with specific reporter
node ace test --reporter=dot
```

## 🐛 Debugging Tests

### Using console.log

```typescript
test('debug test', async ({ client }) => {
  const response = await client.get('/api/spots')
  
  console.log('Response status:', response.status())
  console.log('Response body:', response.body())
  
  response.assertStatus(200)
})
```

### Using debugger

```bash
# Run tests with inspect
node --inspect ace test

# Or with inspect-brk for pause at start
node --inspect-brk ace test
```

## 📚 Resources

- [Japa Documentation](https://japa.dev/docs)
- [AdonisJS Testing](https://docs.adonisjs.com/guides/testing)
- [Sinon.js](https://sinonjs.org/)
- [Faker.js](https://fakerjs.dev/)
