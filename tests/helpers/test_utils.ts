import User from '#models/user'

/**
 * Test utilities for LocalSpots tests
 */
export class TestUtils {
  /**
   * Create a test user and return user data and token
   */
  static async createTestUser(userData: {
    email: string
    password: string
    fullName: string
  }) {
    const user = await User.create(userData)
    return user
  }

  /**
   * Create a test user and get authentication token
   */
  static async createAuthenticatedUser(client: any, userData: {
    email: string
    password: string
    fullName: string
  }) {
    // Register user
    const registerResponse = await client.post('/api/v1/auth/register')
      .json(userData)

    if (registerResponse.status() === 201) {
      return {
        user: registerResponse.body().user,
        token: registerResponse.body().token
      }
    }

    // If registration fails (e.g., user already exists), try to login
    const loginResponse = await client.post('/api/v1/auth/login')
      .json({
        email: userData.email,
        password: userData.password
      })

    return {
      user: loginResponse.body().user,
      token: loginResponse.body().token
    }
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData() {
    await User.query().delete()
  }

  /**
   * Generate test data for different scenarios
   */
  static generateTestData() {
    return {
      validUser: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      },
      anotherUser: {
        email: 'another@example.com',
        password: 'password456',
        fullName: 'Another User'
      },
      invalidUser: {
        email: 'invalid-email',
        password: '123', // Too short
        fullName: ''
      }
    }
  }

  /**
   * Mock JWT token for testing
   */
  static mockJwtToken() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  }

  /**
   * Mock authenticated context for middleware testing
   */
  static mockAuthenticatedContext() {
    return {
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User'
        }
      },
      response: {
        unauthorized: (data: any) => data,
        forbidden: (data: any) => data,
        badRequest: (data: any) => data
      }
    }
  }

  /**
   * Mock unauthenticated context for middleware testing
   */
  static mockUnauthenticatedContext() {
    return {
      auth: {
        isAuthenticated: false
      },
      response: {
        unauthorized: (data: any) => data,
        forbidden: (data: any) => data,
        badRequest: (data: any) => data
      }
    }
  }

  /**
   * Wait for a specified amount of time (useful for testing async operations)
   */
  static async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Generate random email for testing
   */
  static generateRandomEmail() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    return `test-${timestamp}-${random}@example.com`
  }

  /**
   * Generate random password for testing
   */
  static generateRandomPassword(length: number = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}
