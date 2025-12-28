# API Specification

## Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://api.your-domain.com`

## Authentication
All endpoints except auth routes require JWT bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Initiate Strava OAuth
**Endpoint:** `GET /auth/strava/login`

**Description:** Redirects user to Strava authorization page

**Query Parameters:**
None

**Response:** HTTP 302 Redirect to Strava

**Example:**
```
GET /auth/strava/login
→ Redirects to: https://www.strava.com/oauth/authorize?client_id=...&scope=activity:read_all,activity:write...
```

---

### 1.2 Strava OAuth Callback
**Endpoint:** `GET /auth/strava/callback`

**Description:** Handles Strava OAuth callback, exchanges code for tokens

**Query Parameters:**
- `code` (string, required) - Authorization code from Strava
- `scope` (string) - Granted scopes

**Response:** HTTP 302 Redirect to frontend with token
```
→ Redirects to: http://localhost:5173/auth/callback?token=<jwt>
```

**Or Error Response:**
```json
{
  "statusCode": 401,
  "message": "Failed to exchange authorization code",
  "error": "Unauthorized"
}
```

---

### 1.3 Get Current User
**Endpoint:** `GET /auth/me`

**Description:** Returns current authenticated user info

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "stravaAthleteId": 12345678,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 1.4 Refresh JWT Token
**Endpoint:** `POST /auth/refresh`

**Description:** Refresh expired JWT token

**Request Body:**
```json
{
  "refreshToken": "old_jwt_token"
}
```

**Response:** 200 OK
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 3600
}
```

---

### 1.5 Logout
**Endpoint:** `POST /auth/logout`

**Description:** Invalidate JWT token (client-side deletion for MVP)

**Response:** 200 OK
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Training Plans Endpoints

### 2.1 Create Training Plan
**Endpoint:** `POST /api/plans`

**Description:** Create a new training plan

**Request Body:**
```json
{
  "name": "Tayho HM Plan",
  "raceDistance": 21100,
  "raceDate": "2026-04-12"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Tayho HM Plan",
  "raceDistance": 21100,
  "raceDate": "2026-04-12",
  "startDate": "2025-12-22",
  "totalWeeks": 16,
  "isActive": true,
  "createdAt": "2024-12-28T10:00:00.000Z",
  "updatedAt": "2024-12-28T10:00:00.000Z"
}
```

**Validation Errors:** 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "raceDistance must be a positive number",
    "raceDate must be a valid date in the future"
  ],
  "error": "Bad Request"
}
```

---

### 2.2 Get Active Plan
**Endpoint:** `GET /api/plans/active`

**Description:** Get user's currently active training plan

**Response:** 200 OK
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Tayho HM Plan",
  "raceDistance": 21100,
  "raceDate": "2026-04-12",
  "startDate": "2025-12-22",
  "totalWeeks": 16,
  "isActive": true,
  "createdAt": "2024-12-28T10:00:00.000Z",
  "updatedAt": "2024-12-28T10:00:00.000Z"
}
```

**If No Active Plan:** 404 Not Found
```json
{
  "statusCode": 404,
  "message": "No active training plan found",
  "error": "Not Found"
}
```

---

### 2.3 Get Plan by ID
**Endpoint:** `GET /api/plans/:id`

**Description:** Get specific training plan details

**Response:** 200 OK
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Tayho HM Plan",
  "raceDistance": 21100,
  "raceDate": "2026-04-12",
  "startDate": "2025-12-22",
  "totalWeeks": 16,
  "isActive": true,
  "createdAt": "2024-12-28T10:00:00.000Z",
  "updatedAt": "2024-12-28T10:00:00.000Z",
  "workouts": [
    {
      "id": "uuid",
      "weekNumber": 1,
      "scheduledDate": "2025-12-25",
      "workoutType": "Easy",
      "distance": 5500,
      "completedAt": null
    }
    // ... more workouts
  ]
}
```

---

### 2.4 Get Workouts for Plan
**Endpoint:** `GET /api/plans/:id/workouts`

**Description:** Get all workouts for a specific plan

**Query Parameters:**
- `weekNumber` (integer, optional) - Filter by week
- `completed` (boolean, optional) - Filter by completion status

**Response:** 200 OK
```json
{
  "data": [
    {
      "id": "uuid",
      "trainingPlanId": "uuid",
      "weekNumber": 1,
      "scheduledDate": "2025-12-25",
      "workoutType": "Easy",
      "distance": 5500,
      "durationEstimate": 45,
      "description": "Easy pace run to start the plan",
      "completedAt": "2025-12-25T17:30:00.000Z",
      "completions": [
        {
          "id": "uuid",
          "stravaActivity": {
            "id": "uuid",
            "name": "Evening Run",
            "distance": 5600,
            "movingTime": 2700
          }
        }
      ]
    }
  ],
  "total": 32,
  "weekNumber": 1
}
```

---

### 2.5 Deactivate Plan
**Endpoint:** `PATCH /api/plans/:id/deactivate`

**Description:** Deactivate a training plan

**Response:** 200 OK
```json
{
  "id": "uuid",
  "isActive": false,
  "updatedAt": "2024-12-28T10:00:00.000Z"
}
```

---

## 3. Workouts Endpoints

### 3.1 Get Workout by ID
**Endpoint:** `GET /api/workouts/:id`

**Description:** Get detailed workout information

**Response:** 200 OK
```json
{
  "id": "uuid",
  "trainingPlanId": "uuid",
  "weekNumber": 1,
  "scheduledDate": "2025-12-25",
  "workoutType": "Easy",
  "distance": 5500,
  "durationEstimate": 45,
  "description": "Easy pace run to start the plan",
  "completedAt": "2025-12-25T17:30:00.000Z",
  "createdAt": "2024-12-28T10:00:00.000Z",
  "updatedAt": "2024-12-28T10:00:00.000Z",
  "completions": [
    {
      "id": "uuid",
      "matchedAutomatically": true,
      "stravaActivity": {
        "id": "uuid",
        "stravaActivityId": 123456789,
        "name": "Evening Run",
        "distance": 5600,
        "movingTime": 2700,
        "averageSpeed": 2.07,
        "startDateLocal": "2025-12-25T17:30:00.000Z"
      }
    }
  ]
}
```

---

### 3.2 Get Workouts by Week
**Endpoint:** `GET /api/workouts/week/:weekNumber`

**Description:** Get all workouts for a specific week of active plan

**Response:** 200 OK
```json
{
  "weekNumber": 1,
  "dateRange": {
    "start": "2025-12-22",
    "end": "2025-12-28"
  },
  "summary": {
    "totalWorkouts": 2,
    "completed": 0,
    "totalDistance": 14500
  },
  "workouts": [
    {
      "id": "uuid",
      "scheduledDate": "2025-12-25",
      "workoutType": "Easy",
      "distance": 5500,
      "completedAt": null
    },
    {
      "id": "uuid",
      "scheduledDate": "2025-12-28",
      "workoutType": "Long",
      "distance": 9000,
      "completedAt": null
    }
  ]
}
```

---

### 3.3 Get Today's Workout
**Endpoint:** `GET /api/workouts/today`

**Description:** Get workout scheduled for today (if any)

**Response:** 200 OK
```json
{
  "id": "uuid",
  "scheduledDate": "2024-12-28",
  "workoutType": "Easy",
  "distance": 5500,
  "description": "Easy pace run",
  "completedAt": null
}
```

**If No Workout Today:** 200 OK
```json
{
  "message": "No workout scheduled for today",
  "nextWorkout": {
    "id": "uuid",
    "scheduledDate": "2024-12-29",
    "workoutType": "Intervals"
  }
}
```

---

### 3.4 Complete Workout Manually
**Endpoint:** `PATCH /api/workouts/:id/complete`

**Description:** Mark workout as completed (without Strava activity)

**Request Body (optional):**
```json
{
  "stravaActivityId": "uuid",  // Optional: link existing activity
  "notes": "Felt great today!"  // Optional: user notes
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "completedAt": "2024-12-28T10:00:00.000Z",
  "updatedAt": "2024-12-28T10:00:00.000Z"
}
```

---

### 3.5 Uncomplete Workout
**Endpoint:** `PATCH /api/workouts/:id/uncomplete`

**Description:** Mark workout as not completed, unlink activities

**Response:** 200 OK
```json
{
  "id": "uuid",
  "completedAt": null,
  "updatedAt": "2024-12-28T10:00:00.000Z"
}
```

---

## 4. Strava Activities Endpoints

### 4.1 List Activities
**Endpoint:** `GET /api/activities`

**Description:** Get all synced Strava activities for user

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `year` (integer, optional) - Filter by year
- `month` (integer, optional) - Filter by month (1-12)
- `sportType` (string, optional) - Filter by sport type

**Response:** 200 OK
```json
{
  "data": [
    {
      "id": "uuid",
      "stravaActivityId": 123456789,
      "name": "Evening Run",
      "sportType": "Run",
      "distance": 5600,
      "movingTime": 2700,
      "elapsedTime": 2800,
      "averageSpeed": 2.07,
      "averageHeartrate": 145,
      "startDateLocal": "2025-12-25T17:30:00.000Z",
      "isManual": false,
      "completions": [
        {
          "workout": {
            "id": "uuid",
            "workoutType": "Easy",
            "scheduledDate": "2025-12-25"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

### 4.2 Get Activity by ID
**Endpoint:** `GET /api/activities/:id`

**Description:** Get detailed activity information

**Response:** 200 OK
```json
{
  "id": "uuid",
  "stravaActivityId": 123456789,
  "name": "Evening Run",
  "sportType": "Run",
  "distance": 5600,
  "movingTime": 2700,
  "elapsedTime": 2800,
  "averageSpeed": 2.07,
  "averageHeartrate": 145,
  "startDateLocal": "2025-12-25T17:30:00.000Z",
  "isManual": false,
  "rawData": {
    // Full Strava API response
  },
  "completions": [
    {
      "id": "uuid",
      "matchedAutomatically": true,
      "workout": {
        "id": "uuid",
        "workoutType": "Easy",
        "distance": 5500,
        "scheduledDate": "2025-12-25"
      }
    }
  ]
}
```

---

### 4.3 Manual Sync Activities
**Endpoint:** `POST /api/strava/sync`

**Description:** Manually trigger sync of recent Strava activities

**Request Body (optional):**
```json
{
  "days": 7  // How many days back to sync, default: 7
}
```

**Response:** 200 OK
```json
{
  "message": "Sync initiated",
  "activitiesFound": 5,
  "activitiesNew": 2,
  "activitiesUpdated": 1
}
```

---

## 5. Strava Webhook Endpoints

### 5.1 Webhook Verification
**Endpoint:** `GET /webhooks/strava`

**Description:** Strava webhook subscription verification

**Query Parameters:**
- `hub.mode` (string) - "subscribe"
- `hub.challenge` (string) - Challenge token from Strava
- `hub.verify_token` (string) - Verification token

**Response:** 200 OK
```json
{
  "hub.challenge": "challenge_token_from_strava"
}
```

---

### 5.2 Receive Webhook Event
**Endpoint:** `POST /webhooks/strava`

**Description:** Receive activity events from Strava

**Request Body:**
```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "create",
  "owner_id": 12345678,
  "subscription_id": 12345,
  "event_time": 1703505000
}
```

**Response:** 200 OK
```json
{
  "message": "Event received"
}
```

---

## 6. Utility Endpoints

### 6.1 Health Check
**Endpoint:** `GET /health`

**Description:** Check API health status

**Response:** 200 OK
```json
{
  "status": "ok",
  "timestamp": "2024-12-28T10:00:00.000Z",
  "database": "connected",
  "strava": "connected"
}
```

---

### 6.2 API Documentation
**Endpoint:** `GET /api`

**Description:** Swagger UI API documentation

**Response:** HTML page with Swagger UI

---

## Error Responses

### Standard Error Format
All errors follow this structure:
```json
{
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "error": "Bad Request",
  "timestamp": "2024-12-28T10:00:00.000Z",
  "path": "/api/plans"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity` - Business logic error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limiting

**Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per user

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703505600
```

**Rate Limit Exceeded:** 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

---

## Versioning

Current API version: `v1` (implicit, no version in URL for MVP)

Future versioning strategy:
- `/api/v2/plans` for breaking changes
- Maintain v1 for backward compatibility

---

## CORS Configuration

**Allowed Origins (Development):**
- `http://localhost:5173`
- `http://localhost:3000`

**Allowed Origins (Production):**
- `https://your-domain.com`

**Allowed Methods:**
- GET, POST, PATCH, DELETE, OPTIONS

**Allowed Headers:**
- Authorization, Content-Type

---

## Webhook Signature Verification (Future)

For production, verify webhook signatures:
```
X-Strava-Signature: sha256=<signature>
```

Verify using HMAC-SHA256 with webhook secret.