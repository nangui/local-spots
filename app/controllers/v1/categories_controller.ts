import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CategoryService from '#services/category_service'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category_validator'

@inject()
export default class CategoriesController {
  constructor(private categoryService: CategoryService) {}

  /**
   * List all categories
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1) as number
      const limit = request.input('limit', 50) as number

      const categories = await this.categoryService.getAll(page, limit)
      
      return response.status(200).json({
        success: true,
        data: categories.toJSON().data,
        meta: categories.toJSON().meta
      })
    } catch (error) {
      console.error('Error listing categories:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve categories'
      })
    }
  }

  /**
   * Show a specific category
   */
  async show({ params, response }: HttpContext) {
    try {
      const { id } = params
      const categoryId = Number(id)
      
      if (isNaN(categoryId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid category ID'
        })
      }

      const category = await this.categoryService.getById(categoryId)
      
      return response.status(200).json({
        success: true,
        data: category
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Category not found'
        })
      }

      console.error('Error retrieving category:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve category'
      })
    }
  }

  /**
   * Create a new category
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to create a category'
        })
      }

      // TODO: Add admin role check here
      // if (!user.isAdmin) {
      //   return response.status(403).json({
      //     success: false,
      //     error: 'Forbidden',
      //     message: 'Only administrators can create categories'
      //   })
      // }

      const payload = await request.validateUsing(createCategoryValidator)
      
      const category = await this.categoryService.create(payload)
      
      return response.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid category data provided',
          details: error.messages
        })
      }

      if (error.message === 'Category with this name already exists') {
        return response.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Category with this name already exists'
        })
      }

      console.error('Error creating category:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create category'
      })
    }
  }

  /**
   * Update a category
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to update a category'
        })
      }

      // TODO: Add admin role check here
      // if (!user.isAdmin) {
      //   return response.status(403).json({
      //     success: false,
      //     error: 'Forbidden',
      //     message: 'Only administrators can update categories'
      //   })
      // }

      const { id } = params
      const categoryId = Number(id)
      
      if (isNaN(categoryId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid category ID'
        })
      }

      const payload = await request.validateUsing(updateCategoryValidator)
      
      const updatedCategory = await this.categoryService.update(categoryId, payload)
      
      return response.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid category data provided',
          details: error.messages
        })
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Category not found'
        })
      }

      if (error.message === 'Category with this name already exists') {
        return response.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Category with this name already exists'
        })
      }

      console.error('Error updating category:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update category'
      })
    }
  }

  /**
   * Delete a category
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be authenticated to delete a category'
        })
      }

      // TODO: Add admin role check here
      // if (!user.isAdmin) {
      //   return response.status(403).json({
      //     success: false,
      //     error: 'Forbidden',
      //     message: 'Only administrators can delete categories'
      //   })
      // }

      const { id } = params
      const categoryId = Number(id)
      
      if (isNaN(categoryId)) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid category ID'
        })
      }

      await this.categoryService.delete(categoryId)

      return response.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Category not found'
        })
      }

      if (error.message === 'Cannot delete category that has spots') {
        return response.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Cannot delete category that has spots'
        })
      }

      console.error('Error deleting category:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete category'
      })
    }
  }

  /**
   * Get categories with spot count
   */
  async withSpotCount({ response }: HttpContext) {
    try {
      const categories = await this.categoryService.getWithSpotCount()
      
      return response.status(200).json({
        success: true,
        data: categories
      })
    } catch (error) {
      console.error('Error getting categories with spot count:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve categories with spot count'
      })
    }
  }

  /**
   * Get popular categories
   */
  async popular({ request, response }: HttpContext) {
    try {
      const query = request.qs()
      const { limit = 10 } = query
      
      const categories = await this.categoryService.getPopular(Number(limit))
      
      return response.status(200).json({
        success: true,
        data: categories
      })
    } catch (error) {
      console.error('Error getting popular categories:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve popular categories'
      })
    }
  }

  /**
   * Search categories
   */
  async search({ request, response }: HttpContext) {
    try {
      const query = request.qs()
      const { q, page = 1, limit = 20 } = query
      
      if (!q) {
        return response.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Search query parameter is required'
        })
      }

      const categories = await this.categoryService.search(
        q as string,
        Number(page),
        Number(limit)
      )
      
      return response.status(200).json({
        success: true,
        data: categories.toJSON().data,
        meta: categories.toJSON().meta
      })
    } catch (error) {
      console.error('Error searching categories:', error)
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to search categories'
      })
    }
  }
}
