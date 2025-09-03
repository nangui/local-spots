# Password Security Implementation Guide

## Overview

LocalSpots implements a comprehensive password security system that automatically handles password hashing, verification, and re-hashing to ensure passwords always use the latest and most secure hashing algorithms.

## Security Features

### 1. Automatic Password Hashing

- **Model Hooks**: Passwords are automatically hashed before saving using model hooks
- **Latest Algorithms**: Always uses the most recent hashing algorithm configuration
- **No Plain Text Storage**: Passwords are never stored in plain text in the database

### 2. Automatic Password Re-hashing

- **Security Updates**: Automatically detects when passwords need re-hashing
- **Seamless Updates**: Re-hashing happens transparently during login
- **No User Action Required**: Users don't need to reset their passwords

### 3. Multiple Hashing Algorithms

- **Scrypt (Default)**: Memory-hard algorithm resistant to hardware attacks
- **Argon2 (Optional)**: Most secure algorithm, recommended for production
- **Bcrypt (Optional)**: Proven secure algorithm, slower than alternatives

## Implementation Details

### 1. Model Hook for Automatic Hashing

```typescript
// app/models/user.ts
export default class User extends compose(BaseModel, AuthFinder) {
  // ... other properties

  /**
   * Boot method to register hooks
   */
  static boot() {
    super.boot()
    
    // Hook to automatically hash passwords before saving
    this.before('save', async (user: User) => {
      // Only hash the password if it has been modified (and is not already hashed)
      if (user.$dirty.password && !user.password.startsWith('$')) {
        user.password = await hash.make(user.password)
      }
    })
  }
}
```

**How it works:**
1. **Hook Registration**: The `boot()` method registers a `before('save')` hook
2. **Conditional Hashing**: Only hashes passwords that are modified and not already hashed
3. **Automatic Execution**: Runs every time a user is saved
4. **Latest Algorithm**: Uses the current hash configuration from `config/hash.ts`

### 2. Service Layer for Re-hashing

```typescript
// app/services/auth_service.ts
export default class AuthService {
  /**
   * Check if password needs re-hashing and update if necessary
   */
  private async checkAndRehashPassword(user: User, plainTextPassword: string) {
    try {
      // Check if the current password hash uses outdated options
      if (await hash.needsReHash(user.password)) {
        console.log(`Password for user ${user.email} needs re-hashing`)
        
        // Update the password with plain text - model hook will hash it
        user.password = plainTextPassword
        await user.save()
        
        console.log(`Password for user ${user.email} has been re-hashed`)
      }
    } catch (error) {
      console.error(`Error re-hashing password for user ${user.email}:`, error)
      // Don't throw error - this is not critical for login
    }
  }
}
```

**How it works:**
1. **Detection**: Uses `hash.needsReHash()` to check if current hash is outdated
2. **Automatic Update**: Sets plain text password and triggers model hook
3. **Re-hashing**: Model hook automatically hashes with latest algorithm
4. **Error Handling**: Gracefully handles re-hashing errors without blocking login

### 3. Configuration for Hashing Algorithms

```typescript
// config/hash.ts
const hashConfig = defineConfig({
  default: 'scrypt',

  list: {
    // Scrypt - Default and recommended
    scrypt: drivers.scrypt({
      cost: 16384,        // CPU cost factor (2^14)
      blockSize: 8,       // Block size for mixing
      parallelization: 1, // Parallelization factor
      maxMemory: 33554432, // Maximum memory usage (32MB)
    }),

    // Argon2 - Most secure (optional)
    argon: drivers.argon2({
      version: 0x13,      // Argon2id (most secure variant)
      variant: 'id',      // Argon2id
      iterations: 3,      // Number of iterations
      memory: 65536,      // Memory usage in KB (64MB)
      parallelism: 4,     // Number of parallel threads
      saltSize: 16,       // Salt size in bytes
      hashLength: 32,     // Hash length in bytes
    }),
  },
})
```

## Usage Examples

### 1. User Registration

```typescript
// The service automatically handles password hashing
const user = await this.authService.register({
  email: 'user@example.com',
  password: 'plainTextPassword', // Will be automatically hashed
  fullName: 'John Doe'
})
```

### 2. User Login with Re-hashing

```typescript
// During login, passwords are automatically re-hashed if needed
const user = await this.authService.login(email, password)

// If the password hash was outdated, it's automatically updated
// The user doesn't need to do anything
```

### 3. Password Change

```typescript
// Changing password automatically uses latest hashing
await this.authService.updatePassword(user, newPassword)

// The new password is automatically hashed with current algorithm
```

### 4. Manual Password Verification

```typescript
// Verify a password against stored hash
const isValid = await hash.verify(storedHash, plainTextPassword)

// Check if hash needs re-hashing
const needsRehash = await hash.needsReHash(storedHash)
```

## Security Best Practices

### 1. Algorithm Selection

#### **Scrypt (Recommended Default)**
- **Pros**: Memory-hard, resistant to hardware attacks, good performance
- **Cons**: Slightly more complex than bcrypt
- **Use Case**: General purpose, production applications

#### **Argon2 (Most Secure)**
- **Pros**: Winner of Password Hashing Competition, most secure
- **Cons**: Slower than alternatives, higher memory usage
- **Use Case**: High-security applications, when security is paramount

#### **Bcrypt (Proven)**
- **Pros**: Battle-tested, widely supported, simple configuration
- **Cons**: Slower than scrypt, not memory-hard
- **Use Case**: Legacy systems, when simplicity is preferred

### 2. Parameter Tuning

#### **Scrypt Parameters**
```typescript
scrypt: drivers.scrypt({
  cost: 16384,        // Increase for more security (slower)
  blockSize: 8,       // Keep default for compatibility
  parallelization: 1, // Increase for multi-core systems
  maxMemory: 33554432, // Adjust based on available memory
})
```

#### **Argon2 Parameters**
```typescript
argon: drivers.argon2({
  iterations: 3,      // Increase for more security
  memory: 65536,      // Increase for more security (64MB)
  parallelism: 4,     // Match your CPU cores
  saltSize: 16,       // Keep default (secure)
  hashLength: 32,     // Keep default (secure)
})
```

### 3. Migration Strategy

#### **From Legacy Hashes**
1. **Detect Outdated Hashes**: Use `hash.needsReHash()`
2. **Automatic Re-hashing**: Happens during login
3. **Gradual Migration**: No need to reset all passwords at once

#### **Algorithm Changes**
1. **Update Configuration**: Modify `config/hash.ts`
2. **Set New Default**: Change the `default` algorithm
3. **Automatic Migration**: Existing passwords are re-hashed on next login

## API Endpoints

### 1. Change Password

```http
PUT /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Security Features:**
- Requires authentication
- Validates current password
- Enforces minimum password length (8 characters)
- Automatically re-hashes with latest algorithm

### 2. Rate Limiting

The change password endpoint is protected by the same rate limiting as other auth endpoints:
- **Limit**: 5 requests per minute
- **Purpose**: Prevent brute force attacks

## Monitoring and Logging

### 1. Re-hashing Logs

```typescript
// Log when passwords need re-hashing
console.log(`Password for user ${user.email} needs re-hashing`)

// Log successful re-hashing
console.log(`Password for user ${user.email} has been re-hashed`)

// Log re-hashing errors
console.error(`Error re-hashing password for user ${user.email}:`, error)
```

### 2. Security Metrics

Track the following metrics:
- **Re-hashing Frequency**: How often passwords are updated
- **Algorithm Distribution**: Which algorithms are currently in use
- **Error Rates**: Failed re-hashing attempts
- **Performance Impact**: Time taken for re-hashing operations

## Testing

### 1. Unit Tests

```typescript
import { test } from '@japa/runner'
import { AuthService } from '#services/auth_service'
import User from '#models/user'

test.group('Password Security', () => {
  test('should automatically hash passwords on registration', async ({ assert }) => {
    const authService = new AuthService()
    const userData = {
      email: 'test@example.com',
      password: 'plainTextPassword',
      fullName: 'Test User'
    }

    const user = await authService.register(userData)
    
    // Password should be hashed
    assert.notEqual(user.password, 'plainTextPassword')
    assert.isTrue(user.password.startsWith('$'))
  })

  test('should re-hash outdated passwords on login', async ({ assert }) => {
    // Create user with old hash
    const user = await User.create({
      email: 'test@example.com',
      password: 'oldHash',
      fullName: 'Test User'
    })

    const authService = new AuthService()
    
    // Mock hash.needsReHash to return true
    // Test re-hashing logic
  })
})
```

### 2. Integration Tests

```typescript
test('password change should work with authentication', async ({ client }) => {
  // Login to get token
  const loginResponse = await client.post('/api/v1/auth/login')
    .json({
      email: 'user@example.com',
      password: 'oldPassword'
    })

  const token = loginResponse.body().token

  // Change password
  const changeResponse = await client.put('/api/v1/auth/change-password')
    .header('Authorization', `Bearer ${token}`)
    .json({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123'
    })

  changeResponse.assertStatus(200)
  changeResponse.assertBodyContains({
    message: 'Password changed successfully'
  })
})
```

## Troubleshooting

### 1. Common Issues

#### **Passwords Not Being Hashed**
- Check if model hook is properly registered
- Verify `boot()` method is called
- Check for errors in console logs

#### **Re-hashing Not Working**
- Verify `hash.needsReHash()` is working
- Check if password field is being modified
- Ensure model hook is triggered

#### **Performance Issues**
- Reduce hashing parameters for development
- Use memory storage for testing
- Monitor hashing operation times

### 2. Debug Mode

Enable debug logging to see hashing operations:

```bash
LOGGER_LEVEL=debug
```

### 3. Manual Testing

```bash
# Test password hashing manually
node ace tinker

# In tinker:
const hash = require('@adonisjs/core/services/hash').default
const hashed = await hash.make('testPassword')
console.log(hashed)

# Test re-hash detection
const needsRehash = await hash.needsReHash(hashed)
console.log(needsRehash)
```

## Future Enhancements

### 1. Advanced Security Features

- **Password Strength Validation**: Enforce strong password policies
- **Breach Detection**: Check passwords against known breach databases
- **Multi-factor Authentication**: Add 2FA support
- **Password History**: Prevent reuse of recent passwords

### 2. Performance Optimizations

- **Async Hashing**: Non-blocking password operations
- **Batch Re-hashing**: Process multiple passwords simultaneously
- **Caching**: Cache hash verification results
- **Background Jobs**: Move re-hashing to background processes

### 3. Monitoring and Analytics

- **Security Dashboard**: Visualize password security metrics
- **Alert System**: Notify administrators of security issues
- **Compliance Reporting**: Generate security compliance reports
- **Audit Trail**: Track all password-related operations

## Conclusion

The password security system in LocalSpots provides enterprise-grade security with automatic password management. Key benefits include:

- **Automatic Security**: No manual intervention required for security updates
- **Latest Algorithms**: Always uses the most secure hashing algorithms
- **Seamless Migration**: Users don't experience any disruption
- **Comprehensive Logging**: Full visibility into security operations
- **Flexible Configuration**: Support for multiple hashing algorithms
- **Production Ready**: Robust error handling and monitoring

This system ensures that LocalSpots maintains the highest security standards while providing a smooth user experience. The automatic re-hashing feature is particularly valuable for long-running applications that need to stay secure as new vulnerabilities are discovered and new algorithms become available.
