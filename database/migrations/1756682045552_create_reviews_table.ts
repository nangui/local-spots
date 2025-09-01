import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('rating').notNullable().unsigned()
      table.text('comment').nullable()
      table.integer('spot_id').unsigned().references('id').inTable('spots').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Contrainte unique : un seul avis par utilisateur par spot
      table.unique(['spot_id', 'user_id'])
      
      // Index pour les performances
      table.index(['spot_id'])
      table.index(['user_id'])
      table.index(['rating'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
