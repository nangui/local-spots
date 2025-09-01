// Types pour les modèles
export interface CategoryData {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface SpotData {
  id: number
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  categoryId: number
  userId: number
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string | null
  // Relations
  category?: CategoryData
  user?: UserData
  mainPhoto?: SpotPhotoData
  photos?: SpotPhotoData[]
  reviews?: ReviewData[]
  averageRating?: number
  reviewCount?: number
}

export interface ReviewData {
  id: number
  rating: number
  comment: string | null
  spotId: number
  userId: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  // Relations
  user?: UserData
  spot?: SpotData
}

export interface SpotPhotoData {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  spotId: number
  isMain: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface UserData {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
}

// Types pour les requêtes API
export interface CreateSpotRequest {
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  categoryId: number
}

export interface UpdateSpotRequest {
  name?: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  categoryId?: number
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
}

export interface SpotSearchRequest {
  query?: string
  categoryId?: number
  latitude?: number
  longitude?: number
  radius?: number // en km
  limit?: number
  page?: number
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}

// Types pour la géolocalisation
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationBounds {
  northEast: Coordinates
  southWest: Coordinates
}

// Types pour les filtres et tri
export interface SpotFilters {
  categoryId?: number
  isActive?: boolean
  isVerified?: boolean
  minRating?: number
  maxDistance?: number // en km
}

export interface SortOptions {
  field: 'distance' | 'rating' | 'createdAt' | 'name'
  direction: 'asc' | 'desc'
}
