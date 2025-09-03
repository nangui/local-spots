# File Management System

## Overview

LocalSpots implements a comprehensive file management system using AdonisJS Drive with support for multiple storage backends, file validation, and secure access through signed URLs.

## Features

### 🗂️ Multi-Disk Storage
- **Local Storage**: Main storage for development
- **Public Storage**: Publicly accessible files
- **Private Storage**: Secure files requiring signed URLs
- **Spot Photos**: Dedicated storage for spot images
- **User Avatars**: Dedicated storage for user profile pictures
- **Temporary Storage**: For processing and temporary files

### 🔐 Security Features
- **Signed URLs**: Time-limited access to private files
- **File Validation**: Type, size, and content validation
- **Access Control**: User-based file permissions
- **Rate Limiting**: Upload limits to prevent abuse

### 📁 File Organization
- **Structured Paths**: Organized by date and disk type
- **Unique Filenames**: UUID-based naming to prevent conflicts
- **Metadata Storage**: Rich file information and tracking

## Configuration

### Environment Variables

```bash
# File Storage Configuration
DRIVE_DISK=local  # Default disk: local, public, private, spotPhotos, userAvatars, temp
APP_URL=http://localhost:3333  # Base URL for file access
```

### Storage Disks

#### 1. Local Disk (`/uploads`)
- **Location**: `storage/`
- **Visibility**: Public
- **Access**: Direct HTTP access
- **Use Case**: General file storage

#### 2. Public Disk (`/public`)
- **Location**: `storage/public/`
- **Visibility**: Public
- **Access**: Direct HTTP access
- **Use Case**: Public assets, documentation

#### 3. Private Disk (`/private`)
- **Location**: `storage/private/`
- **Visibility**: Private
- **Access**: Signed URLs only
- **Use Case**: Sensitive documents, user data

#### 4. Spot Photos Disk (`/spot-photos`)
- **Location**: `storage/spot-photos/`
- **Visibility**: Public
- **Access**: Direct HTTP access
- **Use Case**: Spot images and galleries

#### 5. User Avatars Disk (`/user-avatars`)
- **Location**: `storage/user-avatars/`
- **Visibility**: Public
- **Access**: Direct HTTP access
- **Use Case**: User profile pictures

#### 6. Temporary Disk (`/temp`)
- **Location**: `storage/temp/`
- **Visibility**: Private
- **Access**: Internal only
- **Use Case**: File processing, temporary uploads

## File Service API

### FileService Class

The `FileService` class provides a comprehensive interface for file operations:

```typescript
import FileService from '#services/file_service'

const fileService = new FileService()
```

### Core Methods

#### 1. File Upload

```typescript
// Single file upload
const fileInfo = await fileService.uploadFile(file, {
  disk: 'spotPhotos',
  visibility: 'public',
  metadata: { spotId: 123, uploadedBy: userId }
})

// Multiple files upload
const filesInfo = await fileService.uploadMultipleFiles(files, {
  disk: 'spotPhotos',
  visibility: 'public'
})
```

#### 2. File Information

```typescript
// Get file details
const fileInfo = await fileService.getFileInfo('path/to/file.jpg', 'spotPhotos')

// File info includes:
// - key: Internal file path
// - url: Public URL (for public files)
// - signedUrl: Temporary access URL (for private files)
// - size: File size in bytes
// - contentType: MIME type
// - lastModified: Last modification date
// - visibility: Public or private
// - metadata: Additional file information
```

#### 3. File Deletion

```typescript
// Delete single file
const deleted = await fileService.deleteFile('path/to/file.jpg', 'spotPhotos')

// Delete multiple files
const results = await fileService.deleteMultipleFiles([
  'path/to/file1.jpg',
  'path/to/file2.jpg'
], 'spotPhotos')
```

#### 4. File Operations

```typescript
// Copy file between disks
const newFile = await fileService.copyFile(
  'source/path.jpg',
  'destination/path.jpg',
  'local',
  'spotPhotos'
)

// Move file between disks
const movedFile = await fileService.moveFile(
  'source/path.jpg',
  'destination/path.jpg',
  'temp',
  'spotPhotos'
)
```

#### 5. Signed URLs

```typescript
// Generate signed URL for private files
const signedUrl = await fileService.getSignedUrl('private/file.pdf', 'private', {
  expiresIn: '2 hours'
})
```

### File Validation

```typescript
// Validate file before upload
const validation = fileService.validateFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
})

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors)
}
```

## File Upload Endpoints

### Spot Photos

#### Upload Photos
```http
POST /api/v1/spots/:spotId/photos
Content-Type: multipart/form-data

photos: [file1, file2, ...]
```

**Response:**
```json
{
  "message": "Photos uploaded successfully",
  "photos": [
    {
      "id": 1,
      "url": "/spot-photos/2024-01-15/uuid1.jpg",
      "filename": "uuid1.jpg",
      "originalName": "vacation.jpg",
      "size": 2048576,
      "mimeType": "image/jpeg",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Photos
```http
GET /api/v1/spots/:spotId/photos
```

#### Get Single Photo
```http
GET /api/v1/spots/:spotId/photos/:id
```

#### Update Photo
```http
PUT /api/v1/spots/:spotId/photos/:id
Content-Type: application/json

{
  "filename": "new-name.jpg",
  "visibility": "private"
}
```

#### Delete Photo
```http
DELETE /api/v1/spots/:spotId/photos/:id
```

## File Storage Structure

### Directory Organization

```
storage/
├── spot-photos/
│   ├── 2024-01-15/
│   │   ├── uuid1.jpg
│   │   └── uuid2.png
│   └── 2024-01-16/
│       └── uuid3.gif
├── user-avatars/
│   ├── 2024-01-15/
│   │   └── uuid4.jpg
│   └── 2024-01-16/
│       └── uuid5.png
├── private/
│   ├── documents/
│   └── temp/
└── public/
    ├── assets/
    └── docs/
```

### File Naming Convention

- **Format**: `{uuid}.{extension}`
- **Path**: `{disk}/{YYYY-MM-DD}/{filename}`
- **Example**: `spot-photos/2024-01-15/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

## Security Considerations

### 1. File Access Control
- **Public Files**: Accessible via direct URLs
- **Private Files**: Require signed URLs with expiration
- **User Permissions**: Users can only access their own files

### 2. File Validation
- **Type Checking**: MIME type validation
- **Size Limits**: Configurable file size restrictions
- **Content Scanning**: Virus scanning (future enhancement)

### 3. Rate Limiting
- **Upload Limits**: 10 photos per hour per user
- **File Size**: Maximum 10MB per file
- **Concurrent Uploads**: Limited to prevent abuse

### 4. Signed URL Security
- **Expiration**: Configurable time limits (default: 1 hour)
- **Unique Signatures**: Each URL has a unique signature
- **Non-transferable**: URLs are tied to specific files

## Performance Optimization

### 1. Storage Backends
- **Local**: Fast access, good for development
- **Redis**: High performance for production
- **CDN**: Future enhancement for global distribution

### 2. File Processing
- **Image Optimization**: Automatic resizing and compression
- **Thumbnail Generation**: Multiple sizes for different use cases
- **Lazy Loading**: Load images on demand

### 3. Caching Strategies
- **Browser Caching**: Long-term caching for static assets
- **CDN Caching**: Edge caching for global performance
- **Application Caching**: Cache file metadata and URLs

## Monitoring and Maintenance

### 1. File Cleanup
```typescript
// Clean up temporary files older than 24 hours
const deletedCount = await fileService.cleanupTempFiles(
  new Date(Date.now() - 24 * 60 * 60 * 1000)
)
```

### 2. Storage Monitoring
- **Disk Usage**: Track storage consumption
- **File Counts**: Monitor file growth
- **Access Patterns**: Analyze file access frequency

### 3. Error Handling
- **Upload Failures**: Log and retry mechanisms
- **Storage Errors**: Fallback to alternative disks
- **Validation Errors**: User-friendly error messages

## Future Enhancements

### 1. Cloud Storage Integration
- **AWS S3**: Scalable cloud storage
- **Google Cloud Storage**: Alternative cloud provider
- **Azure Blob Storage**: Microsoft cloud integration

### 2. Advanced File Processing
- **Image Recognition**: AI-powered content analysis
- **OCR Processing**: Text extraction from images
- **Video Processing**: Thumbnail generation and optimization

### 3. Content Delivery Network
- **Global Distribution**: Faster access worldwide
- **Edge Caching**: Reduced latency
- **Bandwidth Optimization**: Cost-effective delivery

## Troubleshooting

### Common Issues

#### 1. File Upload Failures
- **Check file size limits**
- **Verify file type restrictions**
- **Ensure disk permissions**
- **Check available storage space**

#### 2. Signed URL Issues
- **Verify URL expiration**
- **Check file visibility settings**
- **Ensure proper disk configuration**
- **Validate signature generation**

#### 3. Performance Problems
- **Monitor disk I/O**
- **Check network bandwidth**
- **Optimize file sizes**
- **Implement caching strategies**

### Debug Mode

Enable debug logging:

```bash
LOGGER_LEVEL=debug
```

This provides detailed information about file operations, storage decisions, and error conditions.

## Best Practices

### 1. File Organization
- Use descriptive disk names
- Organize files by date
- Implement consistent naming conventions
- Separate public and private content

### 2. Security
- Validate all file uploads
- Use signed URLs for private content
- Implement proper access controls
- Regular security audits

### 3. Performance
- Optimize file sizes before upload
- Use appropriate storage backends
- Implement caching strategies
- Monitor storage performance

### 4. Maintenance
- Regular cleanup of temporary files
- Monitor storage usage
- Backup critical files
- Update security policies
