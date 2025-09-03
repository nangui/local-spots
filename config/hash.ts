import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'scrypt',

  list: {
    // Scrypt is the default and recommended hashing algorithm
    // It's memory-hard and resistant to hardware attacks
    scrypt: drivers.scrypt({
      cost: 16384,        // CPU cost factor (2^14)
      blockSize: 8,       // Block size for mixing
      parallelization: 1, // Parallelization factor
      maxMemory: 33554432, // Maximum memory usage (32MB)
    }),

    // Argon2 is the most secure hashing algorithm
    // Uncomment and install argon2 package if you want to use it
    // npm install argon2
    /*
    argon: drivers.argon2({
      version: 0x13,      // Argon2id (most secure variant)
      variant: 'id',      // Argon2id
      iterations: 3,      // Number of iterations
      memory: 65536,      // Memory usage in KB (64MB)
      parallelism: 4,     // Number of parallel threads
      saltSize: 16,       // Salt size in bytes
      hashLength: 32,     // Hash length in bytes
    }),
    */

    // Bcrypt is also secure but slower than scrypt/argon2
    // Uncomment if you prefer bcrypt
    /*
    bcrypt: drivers.bcrypt({
      rounds: 12,         // Number of rounds (2^12 = 4096)
    }),
    */
  },
})

export default hashConfig

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> {}
}
