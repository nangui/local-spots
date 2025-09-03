import { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import Drive from '@adonisjs/drive/services/main'
import { inject } from '@adonisjs/core'

@inject()
export default class FileService {
  /**
   * Upload a file to the specified disk
   */
  async uploadFile(file: MultipartFile, disk: string = 'local', path?: string): Promise<string> {
    try {
      // Generate unique filename
      const extension = this.getFileExtension(file)
      const filename = `${randomUUID()}${extension}`
      
      // Determine the key/path for the file
      const key = path ? `${path}/${filename}` : filename
      
      // Upload file to disk
      await Drive.use(disk as any).put(key, file.tmpPath!)
      
      return key
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  /**
   * Delete a file from the specified disk
   */
  async deleteFile(key: string, disk: string = 'local'): Promise<boolean> {
    try {
      await Drive.use(disk as any).delete(key)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  /**
   * Get file extension from filename or MIME type
   */
  private getFileExtension(file: MultipartFile): string {
    // Try to get extension from filename first
    if (file.extname) {
      return file.extname
    }
    
    // Fallback to MIME type
    if (file.type) {
      return this.getExtensionFromMimeType(file.type)
    }
    
    // Default extension
    return '.bin'
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/json': '.json'
    }
    
    return extensions[mimeType] || '.bin'
  }

  /**
   * Check if file type is allowed
   */
  isFileTypeAllowed(file: MultipartFile, allowedTypes: string[] = []): boolean {
    if (allowedTypes.length === 0) {
      return true
    }
    
    if (file.type) {
      return allowedTypes.includes(file.type)
    }
    
    return false
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}
