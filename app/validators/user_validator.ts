import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().trim().minLength(6),
    newPassword: vine.string().trim().minLength(6),
  })
)
