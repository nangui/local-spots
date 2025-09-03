import { test } from '@japa/runner'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Model', (group) => {
  // Use global transaction for each test to keep database clean
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should create a user with hashed password', async ({ assert }) => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    }

    const user = await User.create(userData)

    assert.exists(user.id)
    assert.equal(user.email, userData.email)
    assert.equal(user.fullName, userData.fullName)
    
    // Password should be hashed
    assert.notEqual(user.password, userData.password)
    assert.isTrue(user.password.startsWith('$'))
    assert.isTrue(await hash.verify(user.password, userData.password))
  })

  test('should automatically hash password on update', async ({ assert }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'oldPassword',
      fullName: 'Test User'
    })

    const originalHash = user.password
    
    // Update password
    user.password = 'newPassword'
    await user.save()

    // Password should be re-hashed
    assert.notEqual(user.password, originalHash)
    assert.isTrue(await hash.verify(user.password, 'newPassword'))
  })


  test('should validate required fields', async ({ assert }) => {
    try {
      await User.create({})
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.exists(error)
    }
  })

  test('should enforce unique email constraint', async ({ assert }) => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      fullName: 'Test User'
    }

    // Create first user
    await User.create(userData)

    // Try to create second user with same email
    try {
      await User.create(userData)
      assert.fail('Should have thrown unique constraint error')
    } catch (error) {
      assert.exists(error)
    }
  })

  test('should handle special characters in email and name', async ({ assert }) => {
    const userData = {
      email: 'test+special@example-domain.com',
      password: 'password123',
      fullName: 'José María O\'Connor-Smith'
    }

    const user = await User.create(userData)

    assert.exists(user.id)
    assert.equal(user.email, userData.email)
    assert.equal(user.fullName, userData.fullName)
  })
})
