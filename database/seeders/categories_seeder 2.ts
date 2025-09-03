import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    const categories = [
      {
        name: 'Restaurants & Cafés',
        slug: 'restaurants-cafes',
        icon: '🍽️',
        color: '#FF6B6B',
        description: 'Restaurants, cafés, bars et établissements de restauration',
      },
      {
        name: 'Lieux Culturels',
        slug: 'lieux-culturels',
        icon: '🎭',
        color: '#4ECDC4',
        description: 'Musées, théâtres, cinémas et espaces culturels',
      },
      {
        name: 'Parcs & Nature',
        slug: 'parcs-nature',
        icon: '🌳',
        color: '#45B7D1',
        description: 'Parcs, jardins, forêts et espaces naturels',
      },
      {
        name: 'Sports & Loisirs',
        slug: 'sports-loisirs',
        icon: '⚽',
        color: '#96CEB4',
        description: 'Salles de sport, terrains de jeux et activités sportives',
      },
      {
        name: 'Shopping',
        slug: 'shopping',
        icon: '🛍️',
        color: '#FFEAA7',
        description: 'Boutiques, centres commerciaux et marchés',
      },
      {
        name: 'Transport',
        slug: 'transport',
        icon: '🚇',
        color: '#DDA0DD',
        description: 'Stations de métro, gares et arrêts de bus',
      },
      {
        name: 'Services',
        slug: 'services',
        icon: '🏢',
        color: '#98D8C8',
        description: 'Banques, postes, administrations et services publics',
      },
      {
        name: 'Points d\'Intérêt',
        slug: 'points-interet',
        icon: '📍',
        color: '#F7DC6F',
        description: 'Monuments, statues et lieux historiques',
      },
      {
        name: 'Santé & Bien-être',
        slug: 'sante-bien-etre',
        icon: '🏥',
        color: '#BB8FCE',
        description: 'Hôpitaux, pharmacies et centres de bien-être',
      },
      {
        name: 'Éducation',
        slug: 'education',
        icon: '🎓',
        color: '#85C1E9',
        description: 'Écoles, universités et bibliothèques',
      },
    ]

    for (const categoryData of categories) {
      await Category.updateOrCreate(
        { slug: categoryData.slug },
        categoryData
      )
    }

    console.log('✅ Catégories créées avec succès')
  }
}
