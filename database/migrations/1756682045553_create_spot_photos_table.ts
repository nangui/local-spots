import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'spot_photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('filename').notNullable()
      table.string('original_name').notNullable()
      table.string('mime_type').notNullable()
      table.integer('size').notNullable().unsigned()
      table.string('path').notNullable()
      table.string('url').notNullable()
      table.integer('spot_id').unsigned().references('id').inTable('spots').onDelete('CASCADE')
      table.boolean('is_main').notNullable().defaultTo(false)
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Index pour les performances
      table.index(['spot_id'])
      table.index(['is_main'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
