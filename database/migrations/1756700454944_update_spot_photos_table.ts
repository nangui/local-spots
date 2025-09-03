import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'spot_photos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add new columns for file management
      table.string('file_key').nullable()
      table.string('disk').defaultTo('local')
      table.enum('visibility', ['public', 'private']).defaultTo('public')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.text('metadata').nullable()
      
      // Make existing columns nullable if they don't exist
      table.string('filename').nullable().alter()
      table.string('original_name').nullable().alter()
      table.string('mime_type').nullable().alter()
      table.integer('size').nullable().alter()
      table.string('path').nullable().alter()
      table.string('url').nullable().alter()
      table.boolean('is_main').defaultTo(false).alter()
      table.boolean('is_active').defaultTo(true).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Remove added columns
      table.dropColumn('file_key')
      table.dropColumn('disk')
      table.dropColumn('visibility')
      table.dropColumn('user_id')
      table.dropColumn('metadata')
      
      // Revert column changes
      table.string('filename').notNullable().alter()
      table.string('original_name').notNullable().alter()
      table.string('mime_type').notNullable().alter()
      table.integer('size').notNullable().alter()
      table.string('path').notNullable().alter()
      table.string('url').notNullable().alter()
      table.boolean('is_main').notNullable().alter()
      table.boolean('is_active').notNullable().alter()
    })
  }
}
