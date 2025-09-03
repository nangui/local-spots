import vine from '@vinejs/vine'

export const createSpotValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    description: vine.string().trim().minLength(10).maxLength(1000),
    address: vine.string().trim().minLength(5).maxLength(200),
    latitude: vine.number(),
    longitude: vine.number(),
    categoryId: vine.number(),
    phone: vine.string().trim().optional(),
    website: vine.string().trim().optional(),
    openingHours: vine.string().trim().maxLength(500).optional(),
    priceRange: vine.string().optional(),
    tags: vine.array(vine.string()).optional(),
  })
)

export const updateSpotValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    description: vine.string().trim().minLength(10).maxLength(1000).optional(),
    address: vine.string().trim().minLength(5).maxLength(200).optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    categoryId: vine.number().optional(),
    phone: vine.string().trim().optional(),
    website: vine.string().trim().optional(),
    openingHours: vine.string().trim().maxLength(500).optional(),
    priceRange: vine.string().optional(),
    tags: vine.array(vine.string()).optional(),
  })
)

export const spotsQueryValidator = vine.compile(
  vine.object({
    page: vine.number().optional().transform((val) => val || 1),
    limit: vine.number().optional().transform((val) => val || 20),
    categoryId: vine.number().optional(),
    search: vine.string().trim().optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    radius: vine.number().optional(),
  })
)
