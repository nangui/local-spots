import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'postgis_test'

  async up() {
    // Créer une table de test simple qui fonctionne sur SQLite et PostgreSQL
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 255).notNullable()
      table.decimal('latitude', 10, 8).notNullable() // Latitude en degrés décimaux
      table.decimal('longitude', 11, 8).notNullable() // Longitude en degrés décimaux
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    // Supprimer la table de test
    this.schema.dropTable(this.tableName)
  }
}
