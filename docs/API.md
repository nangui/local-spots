# API Documentation

## 🔗 Base URL

```
http://localhost:3333/api
```

## 🔐 Authentication

The API uses Bearer Token authentication. Include the token in your request headers:

```
Authorization: Bearer <your-token>
```

## 📋 Endpoints

### Authentication

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "johndoe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /auth/login
Login for existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /auth/logout
Logout current user.

**Headers Required:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

---

### Spots (Locations)

#### GET /spots
Get list of all spots.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `category` (string): Filter by category
- `search` (string): Search by name or description

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Central Café",
      "description": "A cozy café in the city center",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "category": "cafe",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "per_page": 10,
    "current_page": 1,
    "last_page": 10
  }
}
```

---

#### GET /spots/:id
Get details of a specific spot.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Central Café",
  "description": "A cozy café in the city center",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "category": "cafe",
  "address": "123 Main Street",
  "opening_hours": {
    "monday": "08:00-20:00",
    "tuesday": "08:00-20:00"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

#### POST /spots
Create a new spot.

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Restaurant",
  "description": "Location description",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "category": "restaurant",
  "address": "456 Champs Avenue"
}
```

**Response:** `201 Created`

---

#### PUT /spots/:id
Update an existing spot.

**Headers Required:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

#### DELETE /spots/:id
Delete a spot.

**Headers Required:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## 🔴 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

## 📄 Error Format

```json
{
  "errors": [
    {
      "field": "email",
      "message": "The email field is required",
      "rule": "required"
    }
  ]
}
```

## 🚀 Rate Limiting

- 100 requests per minute for unauthenticated endpoints
- 1000 requests per minute for authenticated endpoints

## 📝 Notes

- All dates are in ISO 8601 format
- GPS coordinates use WGS84 system
- Paginated responses always include pagination metadata
