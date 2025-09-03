import vine from '@vinejs/vine'

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    description: vine.string().trim().maxLength(500).optional(),
    icon: vine.string().trim().maxLength(50).optional(),
    color: vine.string().trim().maxLength(7).optional(),
  })
)

export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    description: vine.string().trim().maxLength(500).optional(),
    icon: vine.string().trim().maxLength(50).optional(),
    color: vine.string().trim().maxLength(7).optional(),
  })
)
