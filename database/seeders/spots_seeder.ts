import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Spot from '#models/spot'
import User from '#models/user'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    // Récupérer les catégories et un utilisateur
    const categories = await Category.all()
    const users = await User.all()
    
    if (categories.length === 0 || users.length === 0) {
      console.log('Categories ou Users non trouvés. Exécutez d\'abord les seeders correspondants.')
      return
    }

    const restaurantCategory = categories.find(c => c.slug === 'restaurant')
    const parcCategory = categories.find(c => c.slug === 'parc-nature')
    const cultureCategory = categories.find(c => c.slug === 'culture-art')
    const defaultUser = users[0]

    const spots = [
      {
        name: 'Le Petit Bistrot',
        description: 'Un charmant bistrot français avec une cuisine traditionnelle et une ambiance chaleureuse.',
        address: '123 Rue de la Paix, Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        categoryId: restaurantCategory?.id || 1,
        userId: defaultUser.id,
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Parc du Luxembourg',
        description: 'Magnifique parc public avec jardins, fontaines et espaces de détente.',
        address: 'Rue de Vaugirard, Paris',
        latitude: 48.8462,
        longitude: 2.3372,
        categoryId: parcCategory?.id || 2,
        userId: defaultUser.id,
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Musée du Louvre',
        description: 'Le plus grand musée d\'art et d\'antiquités au monde.',
        address: 'Rue de Rivoli, Paris',
        latitude: 48.8606,
        longitude: 2.3376,
        categoryId: cultureCategory?.id || 3,
        userId: defaultUser.id,
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Café de Flore',
        description: 'Café historique fréquenté par les intellectuels et artistes du XXe siècle.',
        address: '172 Boulevard Saint-Germain, Paris',
        latitude: 48.8534,
        longitude: 2.3340,
        categoryId: restaurantCategory?.id || 1,
        userId: defaultUser.id,
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Jardin des Tuileries',
        description: 'Jardin public entre le Louvre et la Place de la Concorde.',
        address: 'Place de la Concorde, Paris',
        latitude: 48.8634,
        longitude: 2.3270,
        categoryId: parcCategory?.id || 2,
        userId: defaultUser.id,
        isActive: true,
        isVerified: true,
      },
    ]

    for (const spotData of spots) {
      await Spot.create(spotData)
    }
  }
}
