import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    const categories = [
      {
        name: 'Restaurant',
        slug: 'restaurant',
        description: 'Restaurants, cafés et bars',
        icon: '🍽️',
        color: '#FF6B6B',
        isActive: true,
      },
      {
        name: 'Parc & Nature',
        slug: 'parc-nature',
        description: 'Parcs, jardins et espaces naturels',
        icon: '🌳',
        color: '#4ECDC4',
        isActive: true,
      },
      {
        name: 'Culture & Art',
        slug: 'culture-art',
        description: 'Musées, galeries et lieux culturels',
        icon: '🎨',
        color: '#45B7D1',
        isActive: true,
      },
      {
        name: 'Sport & Loisirs',
        slug: 'sport-loisirs',
        description: 'Salles de sport, terrains et activités',
        icon: '⚽',
        color: '#96CEB4',
        isActive: true,
      },
      {
        name: 'Shopping',
        slug: 'shopping',
        description: 'Boutiques et centres commerciaux',
        icon: '🛍️',
        color: '#FFEAA7',
        isActive: true,
      },
      {
        name: 'Transport',
        slug: 'transport',
        description: 'Stations de transport et parkings',
        icon: '🚇',
        color: '#DDA0DD',
        isActive: true,
      },
      {
        name: 'Santé & Bien-être',
        slug: 'sante-bien-etre',
        description: 'Cliniques, pharmacies et spas',
        icon: '🏥',
        color: '#F8BBD9',
        isActive: true,
      },
      {
        name: 'Autre',
        slug: 'autre',
        description: 'Autres types de lieux',
        icon: '📍',
        color: '#BDBDBD',
        isActive: true,
      },
    ]

    for (const categoryData of categories) {
      await Category.create(categoryData)
    }
  }
}
