import type { HttpContext } from '@adonisjs/core/http'
import SpotService from '#services/spot_service'
import { createSpotValidator, updateSpotValidator, spotsQueryValidator } from '#validators/spot_validator'
import { inject } from '@adonisjs/core'

@inject()
export default class SpotsController {
  constructor(private spotService: SpotService) {}

  /**
   * List all spots with pagination and filters
   */
  async index({ request, response }: HttpContext) {
    try {
      // Validate query parameters
      const validatedQuery = await request.validateUsing(spotsQueryValidator)
      
      // Additional validation for coordinate parameters
      if (validatedQuery.radius !== undefined) {
        if (validatedQuery.latitude === undefined || validatedQuery.longitude === undefined) {
          return response.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Latitude and longitude are required when radius is provided'
          })
        }
      }
      
      if (validatedQuery.latitude !== undefined && validatedQuery.longitude === undefined) {
        return response.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Longitude is required when latitude is provided'
        })
      }
      
      if (validatedQuery.longitude !== undefined && validatedQuery.latitude === undefined) {
        return response.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Latitude is required when longitude is provided'
        })
      }
      
      const spots = await this.spotService.getAll({
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        categoryId: validatedQuery.categoryId,
        search: validatedQuery.search,
        latitude: validatedQuery.latitude,
        longitude: validatedQuery.longitude,
        radius: validatedQuery.radius,
      })
      
      return response.status(200).json({
        success: true,
        data: spots.toJSON().data,
        meta: spots.toJSON().meta
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid query parameters provided',
          details: error.messages
        })
      }
      
      console.error('Error listing spots:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve spots'
      })
    }
  }

  /**
   * Create a new spot
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to create a spot'
        })
      }

      const payload = await request.validateUsing(createSpotValidator)
      
      const spotData = {
        ...payload,
        userId: user.id
      }

      const spot = await this.spotService.create(spotData)
      
      // Load relationships for response
      await spot.load('category')
      await spot.load('user', (query) => {
        query.select('id', 'username', 'email')
      })

      return response.status(201).json({
        success: true,
        message: 'Spot created successfully',
        data: spot
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid spot data provided',
          details: error.messages
        })
      }

      console.error('Error creating spot:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create spot'
      })
    }
  }

  /**
   * Show a specific spot
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = params
      const spotId = Number(id)
      
      if (isNaN(spotId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid spot ID'
        })
      }

      const spot = await this.spotService.getById(spotId)
      
      return response.status(200).json({
        success: true,
        data: spot
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Spot not found'
        })
      }

      console.error('Error retrieving spot:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve spot'
      })
    }
  }

  /**
   * Update a spot
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to update a spot'
        })
      }

      const { id } = params
      const spotId = Number(id)
      
      if (isNaN(spotId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid spot ID'
        })
      }

      // Check if spot exists and user owns it
      const existingSpot = await this.spotService.getById(spotId)
      if (existingSpot.userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own spots'
        })
      }

      const payload = await request.validateUsing(updateSpotValidator)
      
      const updatedSpot = await this.spotService.update(spotId, payload)
      
      // Load relationships for response
      await updatedSpot.load('category')
      await updatedSpot.load('user', (query) => {
        query.select('id', 'username', 'email')
      })

      return response.status(200).json({
        success: true,
        message: 'Spot updated successfully',
        data: updatedSpot
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid spot data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Spot not found'
        })
      }

      console.error('Error updating spot:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update spot'
      })
    }
  }

  /**
   * Delete a spot
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to delete a spot'
        })
      }

      const { id } = params
      const spotId = Number(id)
      
      if (isNaN(spotId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid spot ID'
        })
      }

      // Check if spot exists and user owns it
      const existingSpot = await this.spotService.getById(spotId)
      if (existingSpot.userId !== user.id) {
        return response.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only delete your own spots'
        })
      }

      await this.spotService.delete(spotId)

      return response.status(200).json({
        success: true,
        message: 'Spot deleted successfully'
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Spot not found'
        })
      }

      console.error('Error deleting spot:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete spot'
      })
    }
  }

  /**
   * Get spots near a location
   */
  async nearby({ request, response }: HttpContext) {
    try {
      const query = request.qs()
      const { latitude, longitude, radius = 10, limit = 20 } = query
      
      if (!latitude || !longitude) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Latitude and longitude are required'
        })
      }

      const spots = await this.spotService.getNearby({
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius),
        limit: Number(limit)
      })

      return response.status(200).json({
        success: true,
        data: spots,
        meta: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius),
          count: spots.length
        }
      })
    } catch (error) {
      console.error('Error getting nearby spots:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve nearby spots'
      })
    }
  }
}
