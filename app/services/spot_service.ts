import Spot from '#models/spot'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'

@inject()
export default class SpotService {
  /**
   * Create a new spot
   */
  async create(spotData: {
    name: string
    description: string
    address: string
    latitude: number
    longitude: number
    categoryId: number
    userId: number
    phone?: string
    website?: string
    openingHours?: string
    priceRange?: string
    tags?: string[]
  }) {
    try {
      const spot = await Spot.create(spotData)
      return spot
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all spots with pagination and filters
   */
  async getAll(query: {
    page?: number
    limit?: number
    categoryId?: number
    search?: string
    latitude?: number
    longitude?: number
    radius?: number
  }) {
    try {
      const { page = 1, limit = 20, categoryId, search, latitude, longitude, radius } = query
      
      let spotsQuery = Spot.query()
        .preload('category')
        .preload('user')
        .preload('photos')
        .preload('reviews')

      // Apply category filter
      if (categoryId) {
        spotsQuery = spotsQuery.where('categoryId', categoryId)
      }

      // Apply search filter
      if (search) {
        // Use case-insensitive search for both SQLite and PostgreSQL
        const connection = db.connection()
        const client = connection.getReadClient().client
        
        if (client === 'sqlite3') {
          // Use LOWER() for case-insensitive search in SQLite
          spotsQuery = spotsQuery.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${search}%`])
            .orWhereRaw('LOWER(description) LIKE LOWER(?)', [`%${search}%`])
            .orWhereRaw('LOWER(address) LIKE LOWER(?)', [`%${search}%`])
        } else {
          spotsQuery = spotsQuery.whereILike('name', `%${search}%`)
            .orWhereILike('description', `%${search}%`)
            .orWhereILike('address', `%${search}%`)
        }
      }

      // Apply geospatial filter (only for PostgreSQL with PostGIS)
      if (latitude && longitude && radius) {
        const connection = db.connection()
        const client = connection.getReadClient().client
        
        if (client === 'postgres') {
          // Use PostGIS spatial query for efficient geospatial queries
          spotsQuery = spotsQuery.whereRaw(`
            ST_DWithin(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(?, ?)::geography,
              ?
            )
          `, [longitude, latitude, radius * 1000]) // Convert km to meters
        } else {
          // Fallback to simple distance calculation for SQLite
          spotsQuery = spotsQuery.whereRaw(`
            (
              (latitude - ?) * (latitude - ?) + 
              (longitude - ?) * (longitude - ?)
            ) <= ?
          `, [latitude, latitude, longitude, longitude, (radius * 0.01) ** 2]) // Rough approximation
        }
      }

      // Use standard pagination for all cases
      const spots = await spotsQuery
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)
      return spots
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific spot by ID
   */
  async getById(id: number) {
    try {
      const spot = await Spot.query()
        .where('id', id)
        .preload('category')
        .preload('user')
        .preload('photos')
        .preload('reviews', (query) => {
          query.orderBy('createdAt', 'desc')
        })
        .firstOrFail()

      return spot
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a spot
   */
  async update(id: number, updateData: Partial<{
    name: string
    description: string
    address: string
    latitude: number
    longitude: number
    categoryId: number
    phone: string
    website: string
    openingHours: string
    priceRange: string
    tags: string[]
  }>) {
    try {
      const spot = await Spot.findOrFail(id)
      spot.merge(updateData)
      await spot.save()
      
      // Reload relationships
      await spot.load('category')
      await spot.load('user')
      await spot.load('photos')
      
      return spot
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a spot
   */
  async delete(id: number) {
    try {
      const spot = await Spot.findOrFail(id)
      await spot.delete()
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Get spots near a specific location
   */
  async getNearby(params: {
    latitude: number
    longitude: number
    radius: number
    limit: number
  }) {
    try {
      const { latitude, longitude, radius, limit } = params
      
      // Use PostGIS for PostgreSQL, simple distance calculation for SQLite
      const connection = db.connection()
      const client = connection.getReadClient().client
      
      let spotsQuery = Spot.query()
        .preload('category')
        .preload('photos')
        .preload('reviews')
        .limit(limit)
      
      if (client === 'postgres') {
        // Use PostGIS spatial query for efficient geospatial queries
        const radiusInMeters = radius * 1000
        spotsQuery = spotsQuery
          .whereRaw(`
            ST_DWithin(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(?, ?)::geography,
              ?
            )
          `, [longitude, latitude, radiusInMeters])
          .orderByRaw(`
            ST_Distance(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(?, ?)::geography
            )
          `, [longitude, latitude])
      } else {
        // Fallback to simple distance calculation for SQLite
        spotsQuery = spotsQuery
          .whereRaw(`
            (
              (latitude - ?) * (latitude - ?) + 
              (longitude - ?) * (longitude - ?)
            ) <= ?
          `, [latitude, latitude, longitude, longitude, (radius * 0.01) ** 2])
          .orderByRaw(`
            (
              (latitude - ?) * (latitude - ?) + 
              (longitude - ?) * (longitude - ?)
            )
          `, [latitude, latitude, longitude, longitude])
      }

      const spots = await spotsQuery
      return spots
    } catch (error) {
      throw error
    }
  }

  /**
   * Get spots by category
   */
  async getByCategory(categoryId: number, page: number = 1, limit: number = 20) {
    try {
      const spots = await Spot.query()
        .where('categoryId', categoryId)
        .preload('category')
        .preload('photos')
        .preload('reviews')
        .orderBy('createdAt', 'desc')
        .paginate(page, limit)

      return spots
    } catch (error) {
      throw error
    }
  }

  /**
   * Search spots by text
   */
  async search(searchTerm: string, page: number = 1, limit: number = 20) {
    try {
      // Use LIKE for SQLite compatibility, ILIKE for PostgreSQL
      const connection = db.connection()
      const client = connection.getReadClient().client
      
      let spotsQuery = Spot.query()
        .preload('category')
        .preload('photos')
        .preload('reviews')
        .orderBy('createdAt', 'desc')
      
      if (client === 'sqlite3') {
        // Use LOWER() for case-insensitive search in SQLite
        spotsQuery = spotsQuery.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${searchTerm}%`])
          .orWhereRaw('LOWER(description) LIKE LOWER(?)', [`%${searchTerm}%`])
          .orWhereRaw('LOWER(address) LIKE LOWER(?)', [`%${searchTerm}%`])
      } else {
        spotsQuery = spotsQuery.whereILike('name', `%${searchTerm}%`)
          .orWhereILike('description', `%${searchTerm}%`)
          .orWhereILike('address', `%${searchTerm}%`)
      }

      // Use standard pagination for all cases
      const spots = await spotsQuery.paginate(page, limit)
      return spots
    } catch (error) {
      throw error
    }
  }
}
