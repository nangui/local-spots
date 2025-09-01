# Models Architecture - LocalSpots MVP

## 📋 Overview

This documentation describes the data model architecture for the LocalSpots MVP, based on AdonisJS with Lucid ORM and PostgreSQL.

## 🗄️ Main Models

### 1. User
**File:** `app/models/user.ts`

**Properties:**
- `id`: Unique identifier
- `fullName`: Full name (optional)
- `email`: Email address (unique)
- `password`: Hashed password
- `createdAt` / `updatedAt`: Timestamps

**Relations:**
- `hasMany(Spot)`: A user can create multiple spots
- `hasMany(Review)`: A user can leave multiple reviews

**Usage:**
```typescript
// Create a user
const user = await User.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
})

// Get user's spots
const userSpots = await user.related('spots').query()
```

### 2. Category
**File:** `app/models/category.ts`

**Properties:**
- `id`: Unique identifier
- `name`: Category name
- `slug`: URL-friendly identifier (unique)
- `description`: Optional description
- `icon`: Emoji or icon
- `color`: Hexadecimal color
- `isActive`: Active/inactive status

**Relations:**
- `hasMany(Spot)`: A category can contain multiple spots

**Default Categories:**
- 🍽️ Restaurant
- 🌳 Park & Nature
- 🎨 Culture & Art
- ⚽ Sports & Leisure
- 🛍️ Shopping
- 🚇 Transport
- 🏥 Health & Wellness
- 📍 Other

### 3. Spot (Location/Place)
**File:** `app/models/spot.ts`

**Properties:**
- `id`: Unique identifier
- `name`: Spot name
- `description`: Detailed description
- `address`: Complete address
- `latitude` / `longitude`: GPS coordinates
- `categoryId`: Reference to category
- `userId`: Reference to user creator
- `isActive`: Active/inactive status
- `isVerified`: Verified by team status

**Relations:**
- `belongsTo(User)`: Each spot belongs to a user
- `belongsTo(Category)`: Each spot belongs to a category
- `hasMany(Review)`: A spot can have multiple reviews
- `hasOne(SpotPhoto)`: A spot has a main photo
- `hasMany(SpotPhoto)`: A spot can have multiple photos

**Performance Indexes:**
- `[latitude, longitude]`: For geospatial queries
- `[categoryId]`: For category filtering
- `[userId]`: For user's spots
- `[isActive]`: For filtering active spots

### 4. Review
**File:** `app/models/review.ts`

**Properties:**
- `id`: Unique identifier
- `rating`: Rating out of 5 stars
- `comment`: Optional comment
- `spotId`: Reference to spot
- `userId`: Reference to user
- `isActive`: Active/inactive status

**Relations:**
- `belongsTo(User)`: Each review belongs to a user
- `belongsTo(Spot)`: Each review belongs to a spot

**Constraints:**
- `UNIQUE(spotId, userId)`: One review per user per spot
- Index on `[spotId, userId, rating, isActive]`

### 5. SpotPhoto
**File:** `app/models/spot_photo.ts`

**Properties:**
- `id`: Unique identifier
- `filename`: Server filename
- `originalName`: Original filename
- `mimeType`: File MIME type
- `size`: Size in bytes
- `path`: Local file path
- `url`: Public file URL
- `spotId`: Reference to spot
- `isMain`: Main spot photo
- `isActive`: Active/inactive status

**Relations:**
- `belongsTo(Spot)`: Each photo belongs to a spot

**Photo Management:**
- One main photo per spot (`isMain = true`)
- Support for multiple photos
- Metadata storage for optimization

## 🔗 Model Relationships

```
User (1) ←→ (N) Spot (1) ←→ (N) Review
  ↓           ↓
  ↓        (1) ←→ (N) SpotPhoto
  ↓           ↓
  ↓        (1) ←→ (1) Category
  ↓
(N) ←→ (N) Review
```

## 📊 Migrations

### Execution Order:
1. `create_categories_table.ts` - Categories table
2. `create_spots_table.ts` - Spots table (depends on categories and users)
3. `create_reviews_table.ts` - Reviews table (depends on spots and users)
4. `create_spot_photos_table.ts` - Photos table (depends on spots)

### Commands:
```bash
# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Reset database
node ace migration:reset
```

## 🌱 Seeders

### CategoriesSeeder
- Creates 8 default categories
- Includes icons, colors, and descriptions

### SpotsSeeder
- Creates 5 test spots with realistic data
- Uses existing categories and users
- GPS coordinates from Paris for testing

### Commands:
```bash
# Run all seeders
node ace db:seed

# Run specific seeder
node ace db:seed --files=categories_seeder
```

## 🎯 MVP Features Supported

### ✅ Spot Discovery
- `Spot` model with precise geolocation
- Relations with categories for filtering
- Support for geospatial search

### ✅ Spot Management
- Creation by authenticated users
- Photos with metadata management
- Verification status for moderation

### ✅ Review System
- 5-star ratings with comments
- Unique constraint per user/spot
- Relations for average calculations

### ✅ Categorization
- 8 predefined categories with icons
- Support for active/inactive categories
- Relations for filtering and display

## 🚀 Performance Optimizations

### Database Indexes
- **Geospatial**: `[latitude, longitude]` for proximity queries
- **Filtering**: `[categoryId, isActive]` for filtered lists
- **Search**: `[spotId, userId]` for relations

### Optimized Queries
- Eager loading of necessary relations
- Pagination for large lists
- Cache for categories (rarely modified)

### Photo Management
- Automatic image compression
- Metadata storage for optimization
- Public URLs for CDN

## 🔒 Security and Validation

### Base Constraints
- Foreign keys with `ON DELETE CASCADE`
- Appropriate uniqueness constraints
- Data type validation

### Authentication
- Relations with AdonisJS auth system
- User permission verification
- Protection against unauthorized access

## 📝 TypeScript Types

### File: `app/types/index.ts`
- Interfaces for all models
- Types for API requests
- Types for responses and pagination
- Types for geolocation and filters

### Advantages
- Type validation at compilation
- IDE autocompletion
- Living code documentation
- Runtime error reduction

## 🧪 Testing

### Recommended Structure
```
tests/
├── unit/
│   ├── models/
│   │   ├── user.test.ts
│   │   ├── spot.test.ts
│   │   └── review.test.ts
│   └── services/
└── integration/
    └── api/
        ├── spots.test.ts
        └── reviews.test.ts
```

### Test Examples
- Relation validation
- Uniqueness constraints
- Cascade deletion handling
- Geospatial query performance

## 🔄 Future Evolutions

### V2 - Social Features
- `UserFollow` model for user relationships
- `SpotCollection` model for personal collections
- `SpotShare` model for spot sharing

### V3 - AI and Recommendations
- `UserPreference` model for preferences
- `SpotAnalytics` model for usage metrics
- `RecommendationEngine` model for AI

## 📚 Resources

- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [Lucid ORM Documentation](https://docs.adonisjs.com/guides/models/introduction)
- [PostgreSQL with AdonisJS](https://docs.adonisjs.com/guides/database/introduction)
- [TypeScript with AdonisJS](https://docs.adonisjs.com/guides/typescript-setup)
