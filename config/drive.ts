import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'local') as 'local' | 'public' | 'private' | 'spotPhotos' | 'userAvatars' | 'temp',

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: { 
    // Main local storage
    local: services.fs({
      location: app.makePath('storage'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
      appUrl: env.get('APP_URL'),
    }),

    // Public files accessible directly
    public: services.fs({
      location: app.makePath('storage/public'),
      serveFiles: true,
      routeBasePath: '/public',
      visibility: 'public',
      appUrl: env.get('APP_URL'),
    }),

    // Private files requiring signed URLs
    private: services.fs({
      location: app.makePath('storage/private'),
      serveFiles: false, // Private files should not be served directly
      visibility: 'private',
      appUrl: env.get('APP_URL'),
    }),

    // Spot photos storage
    spotPhotos: services.fs({
      location: app.makePath('storage/spot-photos'),
      serveFiles: true,
      routeBasePath: '/spot-photos',
      visibility: 'public',
      appUrl: env.get('APP_URL'),
    }),

    // User avatars storage
    userAvatars: services.fs({
      location: app.makePath('storage/user-avatars'),
      serveFiles: true,
      routeBasePath: '/user-avatars',
      visibility: 'public',
      appUrl: env.get('APP_URL'),
    }),

    // Temporary files (private)
    temp: services.fs({
      location: app.makePath('storage/temp'),
      serveFiles: false,
      visibility: 'private',
      appUrl: env.get('APP_URL'),
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}