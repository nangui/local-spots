import vine from '@vinejs/vine'

export const createReviewValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(10).maxLength(1000),
    rating: vine.number(),
  })
)

export const updateReviewValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(10).maxLength(1000).optional(),
    rating: vine.number().optional(),
  })
)
