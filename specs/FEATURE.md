# Features Specification

## MVP (Minimum Viable Product)

### 1. User Authentication
**Priority:** P0 (Critical)

#### Features:
- [x] Strava OAuth 2.0 login
- [x] Token storage and refresh
- [x] User session management with JWT
- [ ] Logout functionality

#### User Flow:
1. User clicks "Connect with Strava"
2. Redirected to Strava authorization
3. User grants permissions
4. Redirected back with auth code
5. Backend exchanges code for tokens
6. User logged in and redirected to dashboard

#### Technical Details:
- OAuth scopes needed: `activity:read_all`, `activity:write`
- Store access_token, refresh_token, expires_at
- Auto-refresh tokens when expired

---

### 2. Training Plan Management
**Priority:** P0 (Critical)

#### Features:
- [x] Create a training plan
  - Input: race distance (5K, 10K, HM, Full)
  - Input: race date
  - Auto-calculate: plan start date, total weeks
- [x] View active training plan
  - Plan overview card
  - Progress tracking (weeks completed)
  - Race countdown
- [ ] Generate workouts for plan
  - Template-based (hardcoded for MVP)
  - Week-by-week structure

#### User Flow:
1. New user prompted to create plan
2. Select race distance from dropdown
3. Pick race date from calendar
4. System generates 16-week plan (for HM)
5. Plan appears on dashboard

#### Business Rules:
- Only one active plan per user
- Plan starts on nearest Monday before race date - 16 weeks
- Template structure:
  - Week 1: 2 workouts (Easy 5.5km, Long 9km)
  - Week 2: 3 workouts (Easy 6.5km, Intervals 5.4km, Long 10km)
  - Progressive volume increase
  - Recovery weeks every 3-4 weeks

---

### 3. Workout Display
**Priority:** P0 (Critical)

#### Features:
- [x] Weekly calendar view
  - Current week highlighted
  - Week selector (Week 1/16 dropdown)
- [x] Workout cards showing:
  - Day of week
  - Workout type (color-coded)
  - Distance
  - Duration estimate
  - Completion status
- [x] Today view
  - Focus on today's workout
  - Quick access to week overview

#### UI Components:
- Calendar header with week navigation
- Workout list (mobile-first)
- Color coding:
  - Green: Easy Run
  - Purple: Long Run
  - Orange: Intervals
  - Blue: Tempo
  - Yellow: Recovery

---

### 4. Strava Activity Sync
**Priority:** P0 (Critical)

#### Features:
- [x] Webhook subscription setup
- [x] Receive webhook events
- [x] Fetch activity details from Strava API
- [x] Store activities in database
- [ ] Auto-match activities to workouts

#### Matching Logic:
```typescript
Match if:
- Activity date = Workout scheduled_date (same day)
- Activity distance within ±10% of workout distance
- Activity sport_type contains "Run"
- Workout not already completed
```

#### User Flow:
1. User completes run and syncs to Strava
2. Strava sends webhook to our backend
3. Backend fetches full activity details
4. Auto-match algorithm runs
5. If match found:
   - Mark workout as completed
   - Link activity to workout
   - Update UI to show completion

---

### 5. Activities Log
**Priority:** P1 (High)

#### Features:
- [x] List all Strava activities
- [x] Filter by month/year
- [x] Display key metrics:
  - Distance
  - Time
  - Average pace
- [ ] Link to matched workout (if any)

#### UI:
- Reverse chronological list
- Month grouping headers
- Activity cards with icon

---

### 6. Manual Workout Completion
**Priority:** P1 (High)

#### Features:
- [ ] Mark workout as complete manually
- [ ] Link existing Strava activity to workout
- [ ] Unlink activity from workout

#### Use Cases:
- Strava activity didn't auto-match (distance off)
- User forgot to record with GPS
- User ran without device

#### User Flow:
1. Tap on workout card
2. See "Mark as Complete" button
3. Option to select from recent activities
4. Or mark complete without activity

---

## Post-MVP Features (Priority Order)

### Phase 2: Enhanced Experience

#### 2.1 Pace Insights
**Priority:** P2

- Calculate target pace zones from recent race time
- Display pace ranges in workout details
- Compare actual pace to target after completion
- Pace trend charts

#### 2.2 Week Summary
**Priority:** P2

- Total km this week
- Workouts completed vs planned
- Weekly progress chart
- Motivational messages

#### 2.3 Notifications
**Priority:** P2

- Reminder for upcoming workout
- Celebration on workout completion
- Weekly summary notifications
- Race week countdown

#### 2.4 Custom Workouts
**Priority:** P2

- Add custom workout to any day
- Modify existing workout distance
- Skip/rest day
- Swap workout days

---

### Phase 3: Advanced Features

#### 3.1 Multiple Plan Templates
**Priority:** P3

- 5K plan (8 weeks)
- 10K plan (10 weeks)
- Half Marathon (12-16 weeks options)
- Full Marathon (16-20 weeks options)
- User selects experience level (beginner/intermediate/advanced)

#### 3.2 Adaptive Training
**Priority:** P3

- Adjust plan based on performance
- Detect overtraining (consecutive missed workouts)
- Suggest rest if pace declining
- Auto-reschedule missed workouts

#### 3.3 Social Features
**Priority:** P3

- Share plan with friends
- Compare progress with other users
- Training group support
- Coach comments

#### 3.4 Analytics Dashboard
**Priority:** P3

- Training load over time
- Fitness trends
- Heart rate zone analysis
- Elevation gain tracking
- Personal records tracking

---

### Phase 4: Premium Features

#### 4.1 Advanced Plan Builder
**Priority:** P4

- AI-generated custom plans
- Integrate cross-training
- Strength training recommendations
- Nutrition guidance

#### 4.2 Race Day Features
**Priority:** P4

- Race day weather forecast
- Pacing strategy calculator
- Race checklist
- Post-race analysis

#### 4.3 Injury Prevention
**Priority:** P4

- Recovery score
- Strain/fatigue tracking
- Rest day recommendations
- Shoe mileage tracking

---

## Technical Requirements by Feature

### MVP Backend APIs

#### Authentication
- `POST /auth/strava/login` - Initiate OAuth
- `GET /auth/strava/callback` - OAuth callback
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

#### Training Plans
- `POST /api/plans` - Create plan
- `GET /api/plans/active` - Get active plan
- `GET /api/plans/:id` - Get plan details
- `GET /api/plans/:id/workouts` - Get all workouts for plan

#### Workouts
- `GET /api/workouts/:id` - Get workout details
- `PATCH /api/workouts/:id/complete` - Mark complete manually
- `GET /api/workouts/week/:weekNumber` - Get workouts for week

#### Strava Sync
- `POST /webhooks/strava` - Receive webhook
- `GET /webhooks/strava/verify` - Verify subscription
- `POST /api/strava/sync` - Manual sync trigger

#### Activities
- `GET /api/activities` - List all activities
- `GET /api/activities/:id` - Get activity details

### MVP Frontend Pages

#### Pages:
1. **Login Page** (`/login`)
   - Strava OAuth button

2. **Onboarding** (`/onboarding`)
   - Create first plan flow

3. **Dashboard/Today** (`/`)
   - Today's workout
   - Week overview card
   - Quick stats

4. **Plan View** (`/plan`)
   - Full plan overview
   - Week selector
   - Progress visualization

5. **Calendar/Week View** (`/week/:weekNumber`)
   - Weekly calendar
   - All workouts for week
   - Completion status

6. **Activities** (`/activities`)
   - Activity list
   - Filters

7. **Workout Detail** (`/workout/:id`)
   - Workout info
   - Completion actions
   - Linked activity (if any)

#### Navigation:
Bottom tab bar (mobile):
- Today
- Plan
- Activities
- Profile (future)

---

## Feature Flags (Optional)

For gradual rollout and testing:

```typescript
const FEATURES = {
  MANUAL_COMPLETION: true,
  PACE_INSIGHTS: false,
  NOTIFICATIONS: false,
  CUSTOM_WORKOUTS: false
};
```

---

## Success Metrics

### MVP Launch Criteria:
- [ ] User can connect Strava account
- [ ] User can create a training plan
- [ ] User can view workouts for current week
- [ ] Strava activities auto-sync via webhook
- [ ] Activities auto-match to workouts
- [ ] Completed workouts show on plan
- [ ] Activities page shows synced runs

### Post-MVP Metrics:
- Weekly active users
- Workout completion rate
- Plan completion rate
- Average workouts per week
- Strava sync success rate
- User retention (4+ weeks)

---

## Out of Scope (Not Building)

### Explicitly NOT included:
- ❌ Native mobile app
- ❌ Apple Health / Garmin Connect integration
- ❌ Treadmill workout support
- ❌ Cycling/triathlon training
- ❌ Payment/subscription system
- ❌ Live GPS tracking
- ❌ Virtual races
- ❌ Challenges/competitions
- ❌ Workout video content
- ❌ Music integration
- ❌ Offline mode