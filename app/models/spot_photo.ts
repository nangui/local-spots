import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Spot from '#models/spot'
import User from '#models/user'

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
  declare fileKey: string

  @column()
  declare disk: string

  @column()
  declare visibility: 'public' | 'private'

  @column()
  declare spotId: number

  @column()
  declare userId: number

  @column()
  declare isMain: boolean

  @column()
  declare isActive: boolean

  @column()
  declare metadata: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => Spot)
  declare spot: BelongsTo<typeof Spot>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Getters and setters for metadata
  get metadataObject(): Record<string, any> {
    try {
      return JSON.parse(this.metadata || '{}')
    } catch {
      return {}
    }
  }

  set metadataObject(value: Record<string, any>) {
    this.metadata = JSON.stringify(value)
  }
}
