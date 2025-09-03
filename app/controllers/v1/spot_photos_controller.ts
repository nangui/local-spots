import type { HttpContext } from '@adonisjs/core/http'
import FileService from '#services/file_service'
import SpotPhoto from '#models/spot_photo'
import { inject } from '@adonisjs/core'

@inject()
export default class SpotPhotosController {
  /**
   * Upload multiple photos for a spot
   */
  async uploadMultiple({ request, response, auth }: HttpContext) {
    try {
      if (!auth.isAuthenticated) {
        return response.unauthorized({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      }

      const spotId = request.param('spotId')
      const files = request.files('photos')

      if (!files || files.length === 0) {
        return response.badRequest({
          error: 'No files provided',
          message: 'Please select at least one photo to upload'
        })
      }

      const fileService = new FileService()
      const validationErrors: string[] = []
      
      // Validate each file
      for (const file of files) {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          validationErrors.push(`File ${file.clientName} is too large. Maximum size is 10MB.`)
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!fileService.isFileTypeAllowed(file, allowedTypes)) {
          validationErrors.push(`File ${file.clientName} has an unsupported type. Allowed types: ${allowedTypes.join(', ')}`)
        }
      }

      if (validationErrors.length > 0) {
        return response.badRequest({
          error: 'File validation failed',
          errors: validationErrors
        })
      }

      // Upload files one by one
      const uploadedFiles: Array<{ key: string; originalName: string; size: number; type: string }> = []
      
      for (const file of files) {
        try {
          const key = await fileService.uploadFile(file, 'spotPhotos', `spots/${spotId}`)
          uploadedFiles.push({
            key,
            originalName: file.clientName || 'Unknown',
            size: file.size,
            type: file.type || 'application/octet-stream'
          })
        } catch (uploadError) {
          console.error(`Error uploading file ${file.clientName}:`, uploadError)
          validationErrors.push(`Failed to upload ${file.clientName}`)
        }
      }

      if (validationErrors.length > 0) {
        return response.badRequest({
          error: 'Some files failed to upload',
          errors: validationErrors
        })
      }

      // Save photo records to database
      const photoRecords = await Promise.all(
        uploadedFiles.map(async (fileInfo) => {
          return SpotPhoto.create({
            spotId,
            userId: auth.user!.id,
            fileKey: fileInfo.key,
            filename: fileInfo.key.split('/').pop() || 'Unknown',
            originalName: fileInfo.originalName,
            size: fileInfo.size,
            mimeType: fileInfo.type,
            url: `/uploads/${fileInfo.key}`,
            path: fileInfo.key,
            disk: 'spotPhotos',
            visibility: 'public',
            metadata: JSON.stringify({
              spotId,
              uploadedBy: auth.user!.id,
              uploadedAt: new Date().toISOString()
            }),
            isMain: false,
            isActive: true
          })
        })
      )

      return response.created({
        message: 'Photos uploaded successfully',
        photos: photoRecords.map(photo => ({
          id: photo.id,
          url: photo.url,
          filename: photo.filename,
          originalName: photo.originalName,
          size: photo.size,
          mimeType: photo.mimeType,
          uploadedAt: photo.createdAt
        }))
      })

    } catch (error) {
      console.error('Error uploading photos:', error)
      return response.internalServerError({
        error: 'Upload failed',
        message: 'Failed to upload photos. Please try again.'
      })
    }
  }

  /**
   * Get photos for a spot
   */
  async index({ request, response }: HttpContext) {
    try {
      const spotId = request.param('spotId')
      
      const photos = await SpotPhoto.query()
        .where('spotId', spotId)
        .orderBy('createdAt', 'desc')

      return response.ok({
        photos: photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          filename: photo.filename,
          originalName: photo.originalName,
          size: photo.size,
          mimeType: photo.mimeType,
          uploadedAt: photo.createdAt,
          uploadedBy: photo.userId
        }))
      })

    } catch (error) {
      console.error('Error fetching photos:', error)
      return response.internalServerError({
        error: 'Fetch failed',
        message: 'Failed to fetch photos. Please try again.'
      })
    }
  }

  /**
   * Get a specific photo
   */
  async show({ request, response }: HttpContext) {
    try {
      const { spotId, id } = request.params()
      
      const photo = await SpotPhoto.query()
        .where('id', id)
        .where('spotId', spotId)
        .firstOrFail()

      return response.ok({
        photo: {
          id: photo.id,
          url: photo.url,
          filename: photo.filename,
          originalName: photo.originalName,
          size: photo.size,
          mimeType: photo.mimeType,
          uploadedAt: photo.createdAt,
          uploadedBy: photo.userId,
          metadata: photo.metadataObject
        }
      })

    } catch (error) {
      return response.notFound({
        error: 'Photo not found',
        message: 'The requested photo could not be found'
      })
    }
  }

  /**
   * Delete a photo
   */
  async destroy({ request, response, auth }: HttpContext) {
    try {
      const { spotId, id } = request.params()
      
      const photo = await SpotPhoto.query()
        .where('id', id)
        .where('spotId', spotId)
        .firstOrFail()

      // Check if user can delete this photo
      if (photo.userId !== auth.user!.id) {
        return response.forbidden({
          error: 'Forbidden',
          message: 'You can only delete photos you uploaded'
        })
      }

      // Delete file from storage
      const fileService = new FileService()
      await fileService.deleteFile(photo.fileKey, photo.disk)

      // Delete database record
      await photo.delete()

      return response.ok({
        message: 'Photo deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting photo:', error)
      return response.internalServerError({
        error: 'Deletion failed',
        message: 'Failed to delete photo. Please try again.'
      })
    }
  }

  /**
   * Update photo metadata
   */
  async update({ request, response, auth }: HttpContext) {
    try {
      const { spotId, id } = request.params()
      const { filename, visibility } = request.only(['filename', 'visibility'])
      
      const photo = await SpotPhoto.query()
        .where('id', id)
        .where('spotId', spotId)
        .firstOrFail()

      // Check if user can modify this photo
      if (photo.userId !== auth.user!.id) {
        return response.forbidden({
          error: 'Forbidden',
          message: 'You can only modify photos you uploaded'
        })
      }

      // Update photo record
      if (filename) photo.filename = filename
      if (visibility && ['public', 'private'].includes(visibility)) {
        photo.visibility = visibility
        
        // Note: AdonisJS Drive doesn't support changing visibility after upload
        // This would require re-uploading the file or implementing custom logic
      }

      await photo.save()

      return response.ok({
        message: 'Photo updated successfully',
        photo: {
          id: photo.id,
          url: photo.url,
          filename: photo.filename,
          originalName: photo.originalName,
          size: photo.size,
          mimeType: photo.mimeType,
          visibility: photo.visibility,
          uploadedAt: photo.createdAt,
          uploadedBy: photo.userId
        }
      })

    } catch (error) {
      console.error('Error updating photo:', error)
      return response.internalServerError({
        error: 'Update failed',
        message: 'Failed to update photo. Please try again.'
      })
    }
  }
}
