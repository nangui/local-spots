import Category from '#models/category'
import Spot from '#models/spot'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'

@inject()
export default class CategoryService {
  /**
   * Get all categories with optional pagination
   */
  async getAll(page: number = 1, limit: number = 50) {
    try {
      const categories = await Category.query()
        .orderBy('name', 'asc')
        .paginate(page, limit)

      return categories
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific category by ID
   */
  async getById(id: number) {
    try {
      const category = await Category.findOrFail(id)
      return category
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a category by name
   */
  async getByName(name: string) {
    try {
      const category = await Category.query()
        .whereILike('name', name)
        .first()

      return category
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new category
   */
  async create(categoryData: {
    name: string
    description?: string
    icon?: string
    color?: string
  }) {
    try {
      // Check if category with same name already exists
      const existingCategory = await this.getByName(categoryData.name)
      if (existingCategory) {
        throw new Error('Category with this name already exists')
      }

      const category = await Category.create(categoryData)
      return category
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a category
   */
  async update(id: number, updateData: Partial<{
    name: string
    description: string
    icon: string
    color: string
  }>) {
    try {
      const category = await Category.findOrFail(id)
      
      // Check if new name conflicts with existing category
      if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await this.getByName(updateData.name)
        if (existingCategory) {
          throw new Error('Category with this name already exists')
        }
      }

      category.merge(updateData)
      await category.save()
      
      return category
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a category
   */
  async delete(id: number) {
    try {
      const category = await Category.findOrFail(id)
      
      // Check if category has spots
      const spotCount = await Spot.query()
        .where('categoryId', id)
        .count('* as total')
        .first()

      if (Number(spotCount?.$extras.total) > 0) {
        throw new Error('Cannot delete category that has spots')
      }

      await category.delete()
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Get categories with spot count
   */
  async getWithSpotCount() {
    try {
      const categories = await db
        .from('categories')
        .select('categories.*')
        .select(db.raw('COUNT(spots.id) as spot_count'))
        .leftJoin('spots', 'categories.id', 'spots.categoryId')
        .groupBy('categories.id')
        .orderBy('categories.name', 'asc')

      return categories
    } catch (error) {
      throw error
    }
  }

  /**
   * Get popular categories (by spot count)
   */
  async getPopular(limit: number = 10) {
    try {
      const categories = await db
        .from('categories')
        .select('categories.*')
        .select(db.raw('COUNT(spots.id) as spot_count'))
        .leftJoin('spots', 'categories.id', 'spots.categoryId')
        .groupBy('categories.id')
        .orderByRaw('COUNT(spots.id) DESC')
        .limit(limit)

      return categories
    } catch (error) {
      throw error
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string, page: number = 1, limit: number = 20) {
    try {
      const categories = await Category.query()
        .whereILike('name', `%${searchTerm}%`)
        .orWhereILike('description', `%${searchTerm}%`)
        .orderBy('name', 'asc')
        .paginate(page, limit)

      return categories
    } catch (error) {
      throw error
    }
  }
}
