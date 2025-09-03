/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

// Global throttle middleware - 100 requests per minute
export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(100).every('1 minute')
})

// Authentication throttle - 5 requests per minute (prevents brute force)
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(5).every('1 minute')
})

// User profile throttle - 60 requests per minute
export const userThrottle = limiter.define('user', () => {
  return limiter.allowRequests(60).every('1 minute')
})

// Spots management throttle - 60 requests per minute
export const spotsThrottle = limiter.define('spots', () => {
  return limiter.allowRequests(60).every('1 minute')
})

// Reviews throttle - 60 requests per minute
export const reviewsThrottle = limiter.define('reviews', () => {
  return limiter.allowRequests(60).every('1 minute')
})

// Categories throttle - 100 requests per minute
export const categoriesThrottle = limiter.define('categories', () => {
  return limiter.allowRequests(100).every('1 minute')
})

// Photo uploads throttle - 10 requests per hour (prevents abuse)
export const photosThrottle = limiter.define('photos', () => {
  return limiter.allowRequests(10).every('1 hour')
})

// Public routes throttle - 30 requests per minute
export const publicThrottle = limiter.define('public', () => {
  return limiter.allowRequests(30).every('1 minute')
})

// API throttle - 200 requests per minute for general API usage
export const apiThrottle = limiter.define('api', () => {
  return limiter.allowRequests(200).every('1 minute')
})

// Health check throttle - 60 requests per minute
export const healthThrottle = limiter.define('health', () => {
  return limiter.allowRequests(60).every('1 minute')
})