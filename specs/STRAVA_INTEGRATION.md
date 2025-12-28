# Strava API Integration Guide

## Overview
Complete guide for integrating with Strava API v3 for activity syncing and OAuth authentication.

---

## 1. Strava App Setup

### 1.1 Create Strava API Application
1. Go to https://www.strava.com/settings/api
2. Create a new application with:
   - **Application Name:** Runna Clone (or your app name)
   - **Category:** Training
   - **Club:** (leave empty)
   - **Website:** http://localhost:5173 (dev) or your production URL
   - **Authorization Callback Domain:** localhost (dev) or your-domain.com (prod)
   - **Application Description:** Training plan app with Strava sync

### 1.2 Get Credentials
After creation, note these values:
- **Client ID:** e.g., 123456
- **Client Secret:** e.g., abc123def456...
- **Access Token:** (for testing only, not used in production)
- **Refresh Token:** (for testing only)

### 1.3 Environment Variables
Add to backend `.env`:
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_CALLBACK_URL=http://localhost:3000/auth/strava/callback
```

---

## 2. OAuth 2.0 Flow

### 2.1 Authorization URL
**Step 1:** Redirect user to Strava authorization:
```
https://www.strava.com/oauth/authorize
  ?client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &response_type=code
  &scope=activity:read_all,activity:write
  &approval_prompt=auto
```

**Scopes needed:**
- `activity:read_all` - Read all activities (including private)
- `activity:write` - Create/update activities

**Optional scopes (future):**
- `profile:read_all` - Read athlete profile
- `profile:write` - Update athlete profile

### 2.2 Authorization Callback
**Step 2:** User approves, Strava redirects back with code:
```
http://localhost:3000/auth/strava/callback?code=abc123&scope=read,activity:read_all,activity:write
```

### 2.3 Token Exchange
**Step 3:** Exchange authorization code for tokens:

**Request:**
```http
POST https://www.strava.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
&code={AUTHORIZATION_CODE}
&grant_type=authorization_code
```

**Response:**
```json
{
  "token_type": "Bearer",
  "expires_at": 1703505600,
  "expires_in": 21600,
  "refresh_token": "abc123refresh",
  "access_token": "abc123access",
  "athlete": {
    "id": 12345678,
    "username": "runner123",
    "resource_state": 2,
    "firstname": "John",
    "lastname": "Doe",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "sex": "M",
    "premium": false,
    "created_at": "2015-01-01T00:00:00Z",
    "updated_at": "2024-12-28T00:00:00Z",
    "profile_medium": "https://...",
    "profile": "https://..."
  }
}
```

### 2.4 Token Refresh
**Tokens expire after 6 hours.** Refresh before making API calls:

**Request:**
```http
POST https://www.strava.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
&grant_type=refresh_token
&refresh_token={REFRESH_TOKEN}
```

**Response:** Same as token exchange response

**Implementation:**
```typescript
async refreshStravaToken(user: User) {
  if (Date.now() < user.stravaTokenExpiresAt.getTime()) {
    return user.stravaAccessToken; // Still valid
  }

  const response = await axios.post('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: user.stravaRefreshToken
  });

  // Update user in database
  await this.usersService.update(user.id, {
    stravaAccessToken: response.data.access_token,
    stravaRefreshToken: response.data.refresh_token,
    stravaTokenExpiresAt: new Date(response.data.expires_at * 1000)
  });

  return response.data.access_token;
}
```

---

## 3. Activities API

### 3.1 Get Activity by ID
**Endpoint:** `GET /api/v3/activities/{id}`

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
```

**Response:**
```json
{
  "id": 123456789,
  "resource_state": 3,
  "name": "Evening Run",
  "distance": 5600.0,
  "moving_time": 2700,
  "elapsed_time": 2800,
  "total_elevation_gain": 45.5,
  "type": "Run",
  "sport_type": "Run",
  "workout_type": 0,
  "start_date": "2024-12-25T10:30:00Z",
  "start_date_local": "2024-12-25T17:30:00+07:00",
  "timezone": "(GMT+07:00) Asia/Bangkok",
  "utc_offset": 25200.0,
  "location_city": null,
  "location_state": null,
  "location_country": "Vietnam",
  "achievement_count": 0,
  "kudos_count": 2,
  "comment_count": 0,
  "athlete_count": 1,
  "photo_count": 0,
  "trainer": false,
  "commute": false,
  "manual": false,
  "private": false,
  "visibility": "everyone",
  "flagged": false,
  "gear_id": null,
  "average_speed": 2.07,
  "max_speed": 4.5,
  "average_cadence": 85.0,
  "average_temp": 28.0,
  "average_heartrate": 145.0,
  "max_heartrate": 175.0,
  "heartrate_opt_out": false,
  "has_heartrate": true,
  "elev_high": 15.0,
  "elev_low": 5.0,
  "upload_id": 987654321,
  "upload_id_str": "987654321",
  "external_id": "garmin_push_123456789",
  "from_accepted_tag": false,
  "pr_count": 0,
  "total_photo_count": 0,
  "has_kudoed": false,
  "athlete": {
    "id": 12345678,
    "resource_state": 1
  }
}
```

### 3.2 Get Logged-in Athlete Activities
**Endpoint:** `GET /api/v3/athlete/activities`

**Query Parameters:**
- `before` (integer) - Unix timestamp, get activities before this time
- `after` (integer) - Unix timestamp, get activities after this time
- `page` (integer) - Page number (default: 1)
- `per_page` (integer) - Items per page (default: 30, max: 200)

**Example:**
```http
GET /api/v3/athlete/activities?after=1703505000&per_page=50
```

**Response:** Array of SummaryActivity objects (similar structure to above, but less detailed)

---

## 4. Webhooks

### 4.1 Create Webhook Subscription
**Endpoint:** `POST /api/v3/push_subscriptions`

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
```

**Request Body:**
```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "callback_url": "https://your-domain.com/webhooks/strava",
  "verify_token": "YOUR_VERIFY_TOKEN"
}
```

**Response:**
```json
{
  "id": 12345,
  "application_id": 123456,
  "callback_url": "https://your-domain.com/webhooks/strava",
  "created_at": "2024-12-28T00:00:00Z",
  "updated_at": "2024-12-28T00:00:00Z"
}
```

**Important:**
- Can only have ONE active subscription per application
- Callback URL must be HTTPS in production
- Strava will send GET request to verify subscription

### 4.2 Webhook Verification
When creating subscription, Strava sends:
```http
GET /webhooks/strava?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=YOUR_VERIFY_TOKEN
```

**Your server must respond:**
```json
{
  "hub.challenge": "15f7d1a91c1f40f8a748fd134752feb3"
}
```

### 4.3 Webhook Events
Strava sends POST requests for activity events:

**Request:**
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

**Event Types:**
- `aspect_type: "create"` - New activity
- `aspect_type: "update"` - Activity updated
- `aspect_type: "delete"` - Activity deleted

**Your Response:** 200 OK (acknowledge receipt)

**Important:**
- Respond quickly (< 2 seconds)
- Process asynchronously (queue job)
- Event only contains ID, must fetch full details via API

### 4.4 View Subscriptions
**Endpoint:** `GET /api/v3/push_subscriptions`

**Response:**
```json
[
  {
    "id": 12345,
    "application_id": 123456,
    "callback_url": "https://your-domain.com/webhooks/strava",
    "created_at": "2024-12-28T00:00:00Z",
    "updated_at": "2024-12-28T00:00:00Z"
  }
]
```

### 4.5 Delete Subscription
**Endpoint:** `DELETE /api/v3/push_subscriptions/{id}`

**Response:** 204 No Content

---

## 5. Rate Limits

### 5.1 Limits
- **15-minute limit:** 200 requests
- **Daily limit:** 2,000 requests
- Applies per application (not per user)

### 5.2 Response Headers
```
X-RateLimit-Limit: 200,2000
X-RateLimit-Usage: 25,150
```

Format: `15min_limit,daily_limit` and `15min_usage,daily_usage`

### 5.3 Exceeding Limits
**Response:** 429 Too Many Requests
```json
{
  "message": "Rate Limit Exceeded",
  "errors": [
    {
      "resource": "Application",
      "field": "rate limit",
      "code": "exceeded"
    }
  ]
}
```

### 5.4 Best Practices
- Cache activity data
- Use webhooks instead of polling
- Batch requests when possible
- Implement exponential backoff
- Monitor usage via response headers

---

## 6. Error Handling

### 6.1 Common Errors

**401 Unauthorized:**
```json
{
  "message": "Authorization Error",
  "errors": [
    {
      "resource": "Athlete",
      "field": "access_token",
      "code": "invalid"
    }
  ]
}
```
**Solution:** Refresh access token

**404 Not Found:**
```json
{
  "message": "Record Not Found",
  "errors": [
    {
      "resource": "Activity",
      "field": "id",
      "code": "not found"
    }
  ]
}
```
**Solution:** Activity may be deleted or private

**403 Forbidden:**
```json
{
  "message": "Forbidden",
  "errors": [
    {
      "resource": "Activity",
      "field": "private",
      "code": "forbidden"
    }
  ]
}
```
**Solution:** Missing required scope

### 6.2 Error Handling Strategy
```typescript
async getStravaActivity(activityId: number, userId: string) {
  try {
    const token = await this.refreshStravaToken(userId);
    
    const response = await axios.get(
      `https://www.strava.com/api/v3/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid, force re-auth
      throw new UnauthorizedException('Strava authentication required');
    }
    if (error.response?.status === 404) {
      // Activity not found or deleted
      return null;
    }
    if (error.response?.status === 429) {
      // Rate limit exceeded
      throw new TooManyRequestsException('Strava rate limit exceeded');
    }
    
    throw error;
  }
}
```

---

## 7. Activity Matching Algorithm

### 7.1 Matching Logic
```typescript
async matchActivityToWorkout(
  activity: StravaActivity,
  userId: string
): Promise<Workout | null> {
  // 1. Get active plan
  const plan = await this.getActivePlan(userId);
  if (!plan) return null;

  // 2. Extract activity date (local timezone)
  const activityDate = new Date(activity.start_date_local)
    .toISOString()
    .split('T')[0];

  // 3. Find workouts on same date, not yet completed
  const candidates = await this.prisma.workout.findMany({
    where: {
      trainingPlanId: plan.id,
      scheduledDate: new Date(activityDate),
      completedAt: null
    }
  });

  if (candidates.length === 0) return null;

  // 4. Check sport type
  if (!activity.sport_type.includes('Run')) {
    return null;
  }

  // 5. Match by distance (±10% tolerance)
  const activityDistanceKm = activity.distance;
  
  for (const workout of candidates) {
    const workoutDistanceKm = workout.distance;
    const tolerance = 0.10;
    const lowerBound = workoutDistanceKm * (1 - tolerance);
    const upperBound = workoutDistanceKm * (1 + tolerance);
    
    if (activityDistanceKm >= lowerBound && activityDistanceKm <= upperBound) {
      return workout;
    }
  }

  return null;
}
```

### 7.2 Edge Cases
- **Multiple workouts same day:** Match to closest distance
- **Multiple activities same day:** Match most recent
- **Activity before plan start:** Ignore
- **Activity after plan end:** Ignore
- **Manual activities:** Include in matching
- **Virtual runs:** Include if sport_type contains "Run"

---

## 8. Implementation Checklist

### Backend Tasks:
- [ ] Set up Strava OAuth endpoints
- [ ] Implement token storage and refresh
- [ ] Create webhook verification endpoint
- [ ] Create webhook event receiver
- [ ] Implement activity fetching
- [ ] Build matching algorithm
- [ ] Set up error handling
- [ ] Add rate limit monitoring
- [ ] Create subscription on app startup
- [ ] Handle subscription cleanup

### Frontend Tasks:
- [ ] "Connect with Strava" button
- [ ] OAuth redirect handling
- [ ] Display Strava connection status
- [ ] Show synced activities
- [ ] Display matched workouts
- [ ] Manual activity linking UI
- [ ] Reconnect flow if token invalid

### Testing:
- [ ] Test OAuth flow end-to-end
- [ ] Verify token refresh works
- [ ] Test webhook verification
- [ ] Test activity create event
- [ ] Test activity update event
- [ ] Test activity delete event
- [ ] Test matching algorithm accuracy
- [ ] Test rate limit handling
- [ ] Test error scenarios

---

## 9. Production Considerations

### 9.1 Security
- Encrypt tokens in database
- Use HTTPS for all callbacks
- Validate webhook signatures (future)
- Never expose Client Secret in frontend
- Implement CORS properly

### 9.2 Reliability
- Queue webhook processing (Bull/BullMQ)
- Retry failed API requests
- Log all webhook events
- Monitor subscription health
- Alert on high error rates

### 9.3 Performance
- Cache activity data
- Index database properly
- Use pagination for large lists
- Debounce webhook processing
- Monitor API usage

### 9.4 Compliance
- Follow Strava Brand Guidelines
- Display Strava attribution
- Respect user privacy settings
- Handle data deletion requests
- Comply with API Agreement

---

## 10. Useful Resources

### Official Documentation:
- API Reference: https://developers.strava.com/docs/reference/
- Getting Started: https://developers.strava.com/docs/getting-started/
- Webhooks Guide: https://developers.strava.com/docs/webhooks/
- Brand Guidelines: https://www.strava.com/about/brand

### Testing:
- Swagger Playground: https://developers.strava.com/playground/
- Postman Collection: Available on GitHub

### Community:
- Developer Community: https://communityhub.strava.com/
- GitHub Examples: Search "strava-api" on GitHub