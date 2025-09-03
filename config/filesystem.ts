import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

export default defineConfig({
  default: env.get('DRIVE_DISK', 'local') as 'local' | 'public' | 'private' | 'spotPhotos' | 'userAvatars' | 'temp',

  services: {
    local: services.fs({
      location: app.makePath('storage'),
      visibility: 'public',
      appUrl: env.get('APP_URL'),
      serveFiles: true,
      routeBasePath: '/uploads',
    }),

    public: services.fs({
      location: app.makePath('storage/public'),
      visibility: 'public',
      appUrl: env.get('APP_URL'),
      serveFiles: true,
      routeBasePath: '/public',
    }),

    private: services.fs({
      location: app.makePath('storage/private'),
      visibility: 'private',
      appUrl: env.get('APP_URL'),
      serveFiles: false, // Private files should not be served directly
    }),

    spotPhotos: services.fs({
      location: app.makePath('storage/spot-photos'),
      visibility: 'public',
      appUrl: env.get('APP_URL'),
      serveFiles: true,
      routeBasePath: '/spot-photos',
    }),

    userAvatars: services.fs({
      location: app.makePath('storage/user-avatars'),
      visibility: 'public',
      appUrl: env.get('APP_URL'),
      serveFiles: true,
      routeBasePath: '/user-avatars',
    }),

    temp: services.fs({
      location: app.makePath('storage/temp'),
      visibility: 'private',
      appUrl: env.get('APP_URL'),
      serveFiles: false,
    }),
  },
})
