import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Spot from './spot.js'

export default class SpotPhoto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare filename: string

  @column()
  declare originalName: string

  @column()
  declare mimeType: string

  @column()
  declare size: number

  @column()
  declare path: string

  @column()
  declare url: string

  @column()
  declare spotId: number

  @column()
  declare isMain: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => Spot)
  declare spot: BelongsTo<typeof Spot>
}
