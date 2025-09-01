# Security Documentation

## 🔒 Security Guide

This document describes the security measures implemented in the Local Spots application and the best practices to follow.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [Validation and Sanitization](#validation-and-sanitization)
- [OWASP Protection](#owasp-protection)
- [Security Headers](#security-headers)
- [Secret Management](#secret-management)
- [Security Audit](#security-audit)
- [Incident Response](#incident-response)

## 🔐 Authentication

### Authentication Strategy

The application uses session-based authentication with optional remember-me tokens.

```typescript
// config/auth.ts
import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'

export default defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: true,
      rememberMeTokensAge: '30 days',
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      }),
    }),
  },
})
```

### Password Hashing

Using bcrypt with a cost of 10 rounds:

```typescript
// config/hash.ts
import { defineConfig } from '@adonisjs/core/hash'
import { bcrypt } from '@adonisjs/core/hash/drivers/bcrypt'

export default defineConfig({
  default: 'bcrypt',
  list: {
    bcrypt: bcrypt({
      rounds: 10,
    }),
  },
})
```

### Password Policy

```typescript
// app/validators/auth_validator.ts
export const passwordRules = vine
  .string()
  .minLength(8)
  .maxLength(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain uppercase, lowercase, number and special character')
```

### Brute Force Protection

```typescript
// app/middleware/throttle_middleware.ts
import { Limiter } from '@adonisjs/limiter/build/services'

export default class ThrottleMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const key = `login_${request.ip()}`
    const limiter = Limiter.use('login')

    if (await limiter.isBlocked(key)) {
      return response.tooManyRequests({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: await limiter.availableIn(key),
      })
    }

    await limiter.attempt(key)
    return next()
  }
}
```

### Secure Sessions

```typescript
// config/session.ts
export default sessionConfig({
  enabled: true,
  driver: 'cookie',
  cookieName: 'adonis-session',
  clearWithBrowser: false,
  age: '2h',
  cookie: {
    path: '/',
    httpOnly: true,
    secure: true,  // HTTPS only
    sameSite: 'lax',
  },
})
```

## 🛡️ Authorization

### Role and Permission System

```typescript
// app/models/user.ts
export default class User extends BaseModel {
  @column()
  declare role: 'admin' | 'moderator' | 'user'

  hasPermission(permission: string): boolean {
    const permissions = {
      admin: ['*'],
      moderator: ['spots.moderate', 'reviews.moderate'],
      user: ['spots.create', 'reviews.create'],
    }

    const userPermissions = permissions[this.role]
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }
}
```

### Policies

```typescript
// app/policies/spot_policy.ts
import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import Spot from '#models/spot'

export default class SpotPolicy extends BasePolicy {
  async viewAny(user: User) {
    return true
  }

  async view(user: User, spot: Spot) {
    return spot.status === 'published' || spot.userId === user.id
  }

  async create(user: User) {
    return user.emailVerifiedAt !== null
  }

  async update(user: User, spot: Spot) {
    return spot.userId === user.id || user.role === 'admin'
  }

  async delete(user: User, spot: Spot) {
    return spot.userId === user.id || user.role === 'admin'
  }
}
```

### Using Policies

```typescript
// app/controllers/spots_controller.ts
export default class SpotsController {
  async update({ bouncer, params, request }: HttpContext) {
    const spot = await Spot.findOrFail(params.id)
    
    await bouncer.with('SpotPolicy').authorize('update', spot)
    
    // Update authorized
    await spot.merge(request.body()).save()
  }
}
```

## 🔐 Data Protection

### Encrypting Sensitive Data

```typescript
// app/services/encryption_service.ts
import Encryption from '@adonisjs/core/services/encryption'

export default class EncryptionService {
  static encrypt(data: string): string {
    return Encryption.encrypt(data)
  }

  static decrypt(encrypted: string): string | null {
    try {
      return Encryption.decrypt(encrypted)
    } catch {
      return null
    }
  }
}
```

### Personal Data Protection (GDPR)

```typescript
// app/models/user.ts
export default class User extends BaseModel {
  // Hide sensitive data in JSON responses
  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare rememberMeToken: string | null

  // Data anonymization
  async anonymize() {
    this.email = `deleted-${this.id}@example.com`
    this.username = `deleted-user-${this.id}`
    this.merge({
      firstName: 'Deleted',
      lastName: 'User',
      phone: null,
      address: null,
    })
    await this.save()
  }
}
```

## ✅ Validation and Sanitization

### Strict Input Validation

```typescript
// app/validators/spot_validator.ts
import vine from '@vinejs/vine'

export const createSpotValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .escape()  // Escape HTML characters
      .minLength(3)
      .maxLength(255),
    
    description: vine
      .string()
      .trim()
      .escape()
      .maxLength(1000)
      .optional(),
    
    latitude: vine
      .number()
      .min(-90)
      .max(90),
    
    longitude: vine
      .number()
      .min(-180)
      .max(180),
    
    website: vine
      .string()
      .url()
      .optional(),
    
    email: vine
      .string()
      .email()
      .normalizeEmail()  // Normalize email
      .optional(),
  })
)
```

### SQL Query Sanitization

```typescript
// Secure Query Builder usage
const search = request.input('search')

// ✅ Good - Bound parameters
const spots = await Spot.query()
  .where('name', 'LIKE', `%${search}%`)
  .orWhere('description', 'LIKE', `%${search}%`)

// ❌ Bad - Possible SQL injection
const spots = await Database.rawQuery(
  `SELECT * FROM spots WHERE name LIKE '%${search}%'`
)
```

## 🛡️ OWASP Protection

### 1. SQL Injection

Protection via Lucid ORM and parameterized queries:

```typescript
// Always use ORM methods or bound parameters
const userId = request.param('userId')
const user = await User.find(userId)  // Secure

// For raw queries, use bindings
const results = await Database.rawQuery(
  'SELECT * FROM users WHERE id = ?',
  [userId]
)
```

### 2. XSS (Cross-Site Scripting)

```typescript
// Automatic protection in Edge templates
// Variables are escaped by default
{{ user.name }}  // Automatically escaped

// For safe HTML only
{{{ trustedHtml }}}  // Not escaped - use with caution
```

### 3. CSRF (Cross-Site Request Forgery)

```typescript
// config/shield.ts
export default shieldConfig({
  csrf: {
    enabled: true,
    exceptRoutes: ['/webhook/*'],  // Exempted routes
    enableXsrfCookie: true,
  },
})
```

### 4. Broken Authentication

```typescript
// Email verification
export default class AuthController {
  async sendVerificationEmail(user: User) {
    const token = await Token.generate(user, 'email_verification')
    
    await Mail.send((message) => {
      message
        .to(user.email)
        .subject('Verify your email')
        .htmlView('emails/verify', { token: token.value })
    })
  }

  async verifyEmail({ request, response }: HttpContext) {
    const token = request.input('token')
    const user = await Token.verify(token, 'email_verification')
    
    if (!user) {
      return response.badRequest('Invalid or expired token')
    }

    user.emailVerifiedAt = DateTime.now()
    await user.save()
  }
}
```

### 5. Sensitive Data Exposure

```typescript
// Never expose sensitive data
export default class UserController {
  async show({ params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    
    // Use serialization to control exposed data
    return user.serialize({
      fields: {
        pick: ['id', 'username', 'email', 'created_at'],
      },
    })
  }
}
```

### 6. Security Misconfiguration

```typescript
// .env.production
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_KEY=your-32-character-random-string  # Generated with `node ace generate:key`
DB_CONNECTION=pg
SESSION_DRIVER=redis  # Not 'cookie' in production for critical apps
CACHE_VIEWS=true
```

## 🔒 Security Headers

### Header Configuration

```typescript
// config/shield.ts
export default shieldConfig({
  xFrame: {
    enabled: true,
    action: 'DENY',
  },
  
  hsts: {
    enabled: true,
    maxAge: '180 days',
    includeSubDomains: true,
    preload: true,
  },
  
  contentTypeSniffing: {
    enabled: true,
  },
  
  xss: {
    enabled: true,
    mode: 'block',
  },
  
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
})
```

## 🔑 Secret Management

### Environment Variables

```bash
# .env
APP_KEY=use-a-random-32-character-string
DB_PASSWORD=use-a-strong-password
JWT_SECRET=another-random-string
SMTP_PASSWORD=smtp-password
API_KEYS=comma,separated,keys
```

### Secret Rotation

```typescript
// app/tasks/rotate_app_key.ts
export default class RotateAppKey {
  public static commandName = 'app:rotate-key'

  async run() {
    const oldKey = Env.get('APP_KEY')
    const newKey = generateRandomKey()
    
    // Re-encrypt data with new key
    await this.reencryptData(oldKey, newKey)
    
    // Update key
    console.log(`New APP_KEY: ${newKey}`)
    console.log('Update your .env file with this new key')
  }
}
```

## 🔍 Security Audit

### Dependency Audit

```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fixes (caution!)
npm audit fix --force
```

### Security Testing

```typescript
// tests/security/auth.spec.ts
test('prevents SQL injection in login', async ({ client }) => {
  const response = await client.post('/login').json({
    email: "admin' OR '1'='1",
    password: "' OR '1'='1",
  })

  response.assertStatus(401)
})

test('prevents XSS in user input', async ({ client, assert }) => {
  const xssPayload = '<script>alert("XSS")</script>'
  
  const response = await client.post('/spots').json({
    name: xssPayload,
    description: xssPayload,
  })

  const spot = await Spot.first()
  assert.notInclude(spot!.name, '<script>')
  assert.notInclude(spot!.description, '<script>')
})
```

### Security Logging

```typescript
// app/services/security_logger.ts
import logger from '@adonisjs/core/services/logger'

export default class SecurityLogger {
  static logFailedLogin(email: string, ip: string) {
    logger.warn('Failed login attempt', {
      email,
      ip,
      timestamp: new Date().toISOString(),
      type: 'FAILED_LOGIN',
    })
  }

  static logSuspiciousActivity(userId: number, activity: string) {
    logger.error('Suspicious activity detected', {
      userId,
      activity,
      timestamp: new Date().toISOString(),
      type: 'SUSPICIOUS_ACTIVITY',
    })
  }

  static logDataAccess(userId: number, resource: string, action: string) {
    logger.info('Data access', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
      type: 'DATA_ACCESS',
    })
  }
}
```

## 🚨 Incident Response

### Incident Response Plan

1. **Detection**: Monitoring and alerts
2. **Containment**: Isolate threat
3. **Eradication**: Remove threat
4. **Recovery**: Restore services
5. **Lessons Learned**: Document and improve

### Emergency Scripts

```typescript
// app/commands/security_lockdown.ts
export default class SecurityLockdown extends BaseCommand {
  static commandName = 'security:lockdown'

  async run() {
    // 1. Disable registrations
    await Setting.set('registrations_enabled', false)
    
    // 2. Force logout all users
    await Session.query().delete()
    
    // 3. Revoke all tokens
    await Token.query().delete()
    
    // 4. Enable maintenance mode
    await Setting.set('maintenance_mode', true)
    
    console.log('🔒 Security lockdown activated')
  }
}
```

## 📋 Security Checklist

### Before Deployment

- [ ] Secure environment variables
- [ ] APP_KEY generated and unique
- [ ] Production mode enabled
- [ ] Debug disabled
- [ ] HTTPS configured
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Security logs configured
- [ ] Automatic backups configured
- [ ] Monitoring in place

### Regular Maintenance

- [ ] Dependency audit (weekly)
- [ ] Security log review (daily)
- [ ] Dependency updates (monthly)
- [ ] Backup restoration test (quarterly)
- [ ] Complete security audit (yearly)

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AdonisJS Security](https://docs.adonisjs.com/guides/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
