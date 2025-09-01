import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Category from './category.js'
import Review from './review.js'
import SpotPhoto from './spot_photo.js'

export default class Spot extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare address: string

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column()
  declare categoryId: number

  @column()
  declare userId: number

  @column()
  declare isActive: boolean

  @column()
  declare isVerified: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @hasOne(() => SpotPhoto)
  declare mainPhoto: HasOne<typeof SpotPhoto>

  @hasMany(() => SpotPhoto)
  declare photos: HasMany<typeof SpotPhoto>
}
