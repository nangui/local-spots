# Database Schema Documentation

## 🗄️ Overview

The application uses **PostgreSQL** as the database management system with **Lucid ORM** for abstraction.

## 📊 Database Schema

### Users Table
Stores user information for the application.

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| email_verified_at | TIMESTAMP | NULL | Email verification date |
| remember_me_token | VARCHAR(255) | NULL | Session token |
| created_at | TIMESTAMP | NOT NULL | Creation date |
| updated_at | TIMESTAMP | NOT NULL | Update date |

**Indexes:**
- `users_email_index` on `email`
- `users_username_index` on `username`

---

### Spots Table
Contains information about local places.

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY | Spot creator |
| name | VARCHAR(255) | NOT NULL | Place name |
| description | TEXT | NULL | Detailed description |
| latitude | DECIMAL(10,8) | NOT NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NOT NULL | GPS longitude |
| address | VARCHAR(500) | NULL | Complete address |
| category | VARCHAR(100) | NOT NULL | Place category |
| status | ENUM | DEFAULT 'active' | Status (active, inactive, pending) |
| created_at | TIMESTAMP | NOT NULL | Creation date |
| updated_at | TIMESTAMP | NOT NULL | Update date |

**Indexes:**
- `spots_user_id_index` on `user_id`
- `spots_category_index` on `category`
- `spots_location_index` on `(latitude, longitude)`

**Relations:**
- `user_id` → `users.id` (CASCADE DELETE)

---

### Categories Table
Defines available place categories.

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL slug |
| description | TEXT | NULL | Description |
| icon | VARCHAR(50) | NULL | Icon name |
| created_at | TIMESTAMP | NOT NULL | Creation date |
| updated_at | TIMESTAMP | NOT NULL | Update date |

---

### Reviews Table
Stores user reviews for spots.

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY | Review author |
| spot_id | INTEGER | FOREIGN KEY | Concerned spot |
| rating | INTEGER | NOT NULL | Rating (1-5) |
| comment | TEXT | NULL | Comment |
| created_at | TIMESTAMP | NOT NULL | Creation date |
| updated_at | TIMESTAMP | NOT NULL | Update date |

**Constraints:**
- `UNIQUE(user_id, spot_id)` - A user can only leave one review per spot
- `CHECK (rating >= 1 AND rating <= 5)` - Rating must be between 1 and 5

**Relations:**
- `user_id` → `users.id` (CASCADE DELETE)
- `spot_id` → `spots.id` (CASCADE DELETE)

---

### Favorites Table
Manages user favorite spots.

| Column | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY | User |
| spot_id | INTEGER | FOREIGN KEY | Favorite spot |
| created_at | TIMESTAMP | NOT NULL | Addition date |

**Constraints:**
- `UNIQUE(user_id, spot_id)` - No duplicates

**Relations:**
- `user_id` → `users.id` (CASCADE DELETE)
- `spot_id` → `spots.id` (CASCADE DELETE)

---

## 🔄 Migrations

Migrations are managed by AdonisJS and located in the `database/migrations/` folder.

### Useful Commands

```bash
# Run migrations
node ace migration:run

# Rollback last migration
node ace migration:rollback

# Reset all migrations
node ace migration:reset

# Check migration status
node ace migration:status

# Create new migration
node ace make:migration create_table_name
```

## 🌱 Seeders

Seeders allow populating the database with test data.

```bash
# Create a seeder
node ace make:seeder UserSeeder

# Run all seeders
node ace db:seed
```

## 📈 Optimizations

### Recommended Indexes
- Composite index on `spots(latitude, longitude)` for geospatial queries
- Index on `reviews(spot_id, created_at)` for recent review queries
- Index on `spots(category, status)` for filtering

### Performance Considerations
1. **Pagination**: Always paginate results to avoid loading too much data
2. **Eager Loading**: Use `.preload()` to avoid N+1 problem
3. **Cache**: Implement Redis cache for frequent queries
4. **Indexes**: Keep indexes up to date and regularly analyze performance

## 🔐 Security

1. **Passwords**: Hashed with bcrypt (salt rounds: 10)
2. **SQL Injection**: Protection via Lucid ORM and bound parameters
3. **FK Constraints**: CASCADE DELETE to maintain referential integrity
4. **Validation**: Data validation at application level with VineJS

## 🔄 Backup and Restoration

### Backup
```bash
pg_dump -U username -h localhost database_name > backup.sql
```

### Restoration
```bash
psql -U username -h localhost database_name < backup.sql
```

## 📊 ER Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Users     │      │    Spots    │      │  Categories │
├─────────────┤      ├─────────────┤      ├─────────────┤
│ id (PK)     │1────*│ id (PK)     │*────1│ id (PK)     │
│ username    │      │ user_id(FK) │      │ name        │
│ email       │      │ name        │      │ slug        │
│ password    │      │ category    │      │ description │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       │                    │
       │1                   │1
       │                    │
       │*                   │*
┌─────────────┐      ┌─────────────┐
│  Favorites  │      │   Reviews   │
├─────────────┤      ├─────────────┤
│ id (PK)     │      │ id (PK)     │
│ user_id(FK) │      │ user_id(FK) │
│ spot_id(FK) │      │ spot_id(FK) │
│             │      │ rating      │
│             │      │ comment     │
└─────────────┘      └─────────────┘
```
