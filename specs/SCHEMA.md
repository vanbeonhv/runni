# Database Schema Design

## Overview
PostgreSQL database with Prisma ORM for a running training application with Strava integration.

## Schema Diagram (Text Representation)

```
users (1) ──< (many) training_plans
users (1) ──< (many) strava_activities
training_plans (1) ──< (many) workouts
workouts (many) ──< (many) strava_activities [via workout_completions]
```

## Tables

### users
Stores user account information and Strava authentication tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| name | VARCHAR(255) | | Display name |
| strava_athlete_id | BIGINT | UNIQUE | Strava athlete ID |
| strava_access_token | TEXT | | OAuth access token (encrypt in production) |
| strava_refresh_token | TEXT | | OAuth refresh token (encrypt in production) |
| strava_token_expires_at | TIMESTAMP | | Token expiration time |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_strava_id` on `strava_athlete_id`
- `idx_users_email` on `email`

### training_plans
Training plans for race preparation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Plan identifier |
| user_id | UUID | FK → users.id, NOT NULL | Owner of the plan |
| name | VARCHAR(255) | NOT NULL | Plan name (e.g., "Tayho HM Plan") |
| race_distance | INTEGER | NOT NULL | Target race distance in meters |
| race_date | DATE | NOT NULL | Target race date |
| start_date | DATE | NOT NULL | Plan start date |
| total_weeks | INTEGER | NOT NULL | Total weeks in plan |
| is_active | BOOLEAN | DEFAULT TRUE | Only one active plan per user |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- `one_active_plan_per_user`: EXCLUDE (user_id WITH =) WHERE (is_active = TRUE)

**Indexes:**
- `idx_plans_user` on `user_id`
- `idx_plans_active` on `is_active`

### workouts
Individual workout sessions within a training plan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Workout identifier |
| training_plan_id | UUID | FK → training_plans.id, NOT NULL | Parent plan |
| week_number | INTEGER | NOT NULL, CHECK > 0 | Week number in plan (1-16) |
| scheduled_date | DATE | NOT NULL | Planned workout date |
| workout_type | VARCHAR(50) | NOT NULL | Type: Easy, Long, Intervals, Tempo, Recovery |
| distance | INTEGER | NOT NULL, CHECK > 0 | Target distance in meters |
| duration_estimate | INTEGER | | Estimated duration in minutes |
| description | TEXT | | Workout instructions/notes |
| completed_at | TIMESTAMP | NULLABLE | When workout was completed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Workout Types:**
- `Easy` - Easy/recovery pace run
- `Long` - Long endurance run
- `Intervals` - Speed/interval training
- `Tempo` - Tempo/threshold run
- `Recovery` - Active recovery run

**Indexes:**
- `idx_workouts_plan` on `training_plan_id`
- `idx_workouts_date` on `scheduled_date`
- `idx_workouts_completed` on `completed_at`

### strava_activities
Activities synced from Strava API.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Internal activity ID |
| user_id | UUID | FK → users.id, NOT NULL | Activity owner |
| strava_activity_id | BIGINT | UNIQUE, NOT NULL | Strava's activity ID |
| name | VARCHAR(255) | | Activity name from Strava |
| sport_type | VARCHAR(50) | NOT NULL | Run, TrailRun, VirtualRun, etc. |
| distance | INTEGER | NOT NULL | Distance in meters |
| moving_time | INTEGER | NOT NULL | Moving time in seconds |
| elapsed_time | INTEGER | NOT NULL | Total elapsed time in seconds |
| average_speed | DECIMAL(10,2) | | Average speed in m/s |
| average_heartrate | DECIMAL(10,2) | | Average heart rate in bpm |
| start_date_local | TIMESTAMP | NOT NULL | Activity start time (local timezone) |
| is_manual | BOOLEAN | DEFAULT FALSE | Manually created activity |
| raw_data | JSONB | | Full Strava API response |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_activities_user` on `user_id`
- `idx_activities_date` on `start_date_local`
- `idx_activities_strava_id` on `strava_activity_id`

**Example raw_data JSONB:**
```json
{
  "id": 123456789,
  "name": "Morning Run",
  "type": "Run",
  "workout_type": 0,
  "trainer": false,
  "total_elevation_gain": 45.5,
  "max_speed": 4.5,
  "max_heartrate": 175.0
}
```

### workout_completions
Junction table linking workouts to Strava activities (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Completion record ID |
| workout_id | UUID | FK → workouts.id, NOT NULL | Completed workout |
| strava_activity_id | UUID | FK → strava_activities.id, NOT NULL | Matching Strava activity |
| matched_automatically | BOOLEAN | DEFAULT TRUE | Auto-matched vs manual |
| created_at | TIMESTAMP | DEFAULT NOW() | When match was made |

**Constraints:**
- `UNIQUE(workout_id, strava_activity_id)` - prevent duplicate matches

**Indexes:**
- `idx_completions_workout` on `workout_id`
- `idx_completions_activity` on `strava_activity_id`

### strava_webhook_events
Log of webhook events from Strava for debugging and processing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Event record ID |
| strava_athlete_id | BIGINT | | Strava athlete ID |
| object_type | VARCHAR(50) | NOT NULL | activity, athlete, etc. |
| object_id | BIGINT | NOT NULL | Strava object ID |
| aspect_type | VARCHAR(50) | NOT NULL | create, update, delete |
| event_time | TIMESTAMP | NOT NULL | When event occurred |
| processed | BOOLEAN | DEFAULT FALSE | Processing status |
| processed_at | TIMESTAMP | | When processing completed |
| error_message | TEXT | | Error if processing failed |
| raw_payload | JSONB | NOT NULL | Full webhook payload |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_webhook_processed` on `processed`
- `idx_webhook_athlete` on `strava_athlete_id`
- `idx_webhook_created` on `created_at`

## Prisma Schema

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                     String             @id @default(uuid()) @db.Uuid
  email                  String             @unique @db.VarChar(255)
  name                   String?            @db.VarChar(255)
  stravaAthleteId        BigInt?            @unique @map("strava_athlete_id")
  stravaAccessToken      String?            @map("strava_access_token") @db.Text
  stravaRefreshToken     String?            @map("strava_refresh_token") @db.Text
  stravaTokenExpiresAt   DateTime?          @map("strava_token_expires_at")
  createdAt              DateTime           @default(now()) @map("created_at")
  updatedAt              DateTime           @updatedAt @map("updated_at")

  trainingPlans          TrainingPlan[]
  stravaActivities       StravaActivity[]

  @@index([stravaAthleteId])
  @@index([email])
  @@map("users")
}

model TrainingPlan {
  id           String    @id @default(uuid()) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  name         String    @db.VarChar(255)
  raceDistance Int       @map("race_distance")
  raceDate     DateTime  @map("race_date") @db.Date
  startDate    DateTime  @map("start_date") @db.Date
  totalWeeks   Int       @map("total_weeks")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workouts     Workout[]

  @@index([userId])
  @@map("training_plans")
}

model Workout {
  id               String    @id @default(uuid()) @db.Uuid
  trainingPlanId   String    @map("training_plan_id") @db.Uuid
  weekNumber       Int       @map("week_number")
  scheduledDate    DateTime  @map("scheduled_date") @db.Date
  workoutType      String    @map("workout_type") @db.VarChar(50)
  distance         Int
  durationEstimate Int?      @map("duration_estimate")
  description      String?   @db.Text
  completedAt      DateTime? @map("completed_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  trainingPlan     TrainingPlan         @relation(fields: [trainingPlanId], references: [id], onDelete: Cascade)
  completions      WorkoutCompletion[]

  @@index([trainingPlanId])
  @@map("workouts")
}

model StravaActivity {
  id                 String    @id @default(uuid()) @db.Uuid
  userId             String    @map("user_id") @db.Uuid
  stravaActivityId   BigInt    @unique @map("strava_activity_id")
  name               String?   @db.VarChar(255)
  sportType          String    @map("sport_type") @db.VarChar(50)
  distance           Int
  movingTime         Int       @map("moving_time")
  elapsedTime        Int       @map("elapsed_time")
  averageSpeed       Decimal?  @map("average_speed") @db.Decimal(10, 2)
  averageHeartrate   Decimal?  @map("average_heartrate") @db.Decimal(10, 2)
  startDateLocal     DateTime  @map("start_date_local")
  isManual           Boolean   @default(false) @map("is_manual")
  rawData            Json?     @map("raw_data")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  user               User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions        WorkoutCompletion[]

  @@index([userId])
  @@index([stravaActivityId])
  @@map("strava_activities")
}

model WorkoutCompletion {
  id                   String         @id @default(uuid()) @db.Uuid
  workoutId            String         @map("workout_id") @db.Uuid
  stravaActivityId     String         @map("strava_activity_id") @db.Uuid
  matchedAutomatically Boolean        @default(true) @map("matched_automatically")
  createdAt            DateTime       @default(now()) @map("created_at")

  workout              Workout        @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  stravaActivity       StravaActivity @relation(fields: [stravaActivityId], references: [id], onDelete: Cascade)

  @@unique([workoutId, stravaActivityId])
  @@index([workoutId])
  @@index([stravaActivityId])
  @@map("workout_completions")
}

model StravaWebhookEvent {
  id               String    @id @default(uuid()) @db.Uuid
  stravaAthleteId  BigInt?   @map("strava_athlete_id")
  objectType       String    @map("object_type") @db.VarChar(50)
  objectId         BigInt    @map("object_id")
  aspectType       String    @map("aspect_type") @db.VarChar(50)
  eventTime        DateTime  @map("event_time")
  processed        Boolean   @default(false)
  processedAt      DateTime? @map("processed_at")
  errorMessage     String?   @map("error_message") @db.Text
  rawPayload       Json      @map("raw_payload")
  createdAt        DateTime  @default(now()) @map("created_at")

  @@index([stravaAthleteId])
  @@map("strava_webhook_events")
}
```

## Migration Strategy

### Initial Setup
```bash
# Initialize Prisma
npx prisma init

# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Subsequent Migrations
```bash
# After schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy
```

## Common Queries

### Get active plan with workouts for user
```typescript
const plan = await prisma.trainingPlan.findFirst({
  where: {
    userId: userId,
    isActive: true
  },
  include: {
    workouts: {
      orderBy: { scheduledDate: 'asc' }
    }
  }
});
```

### Get workouts for current week
```typescript
const workouts = await prisma.workout.findMany({
  where: {
    trainingPlanId: planId,
    scheduledDate: {
      gte: startOfWeek,
      lte: endOfWeek
    }
  },
  include: {
    completions: {
      include: {
        stravaActivity: true
      }
    }
  }
});
```

### Match Strava activity to workout
```typescript
const workout = await prisma.workout.findFirst({
  where: {
    trainingPlanId: planId,
    scheduledDate: activityDate,
    completedAt: null,
    distance: {
      gte: activity.distance * 0.9, // 10% tolerance
      lte: activity.distance * 1.1
    }
  }
});
```

## Data Integrity

### Cascade Deletions
- Deleting a user → deletes all their plans, activities, webhook events
- Deleting a plan → deletes all its workouts
- Deleting a workout/activity → deletes completion records

### Constraints
- One active training plan per user
- Unique Strava activity IDs
- Unique workout-activity completion pairs
- Positive values for distance, week numbers

## Performance Considerations

### Indexes
All foreign keys are indexed for join performance
Date fields indexed for range queries
Status fields (is_active, processed) indexed for filtering

### JSONB Usage
- raw_data and raw_payload use JSONB for flexibility
- Can query JSON fields: `WHERE raw_data->>'workout_type' = '1'`
- Consider extracting frequently queried fields to columns

### Future Optimization
- Partitioning strava_activities by date if volume grows
- Materialized views for complex analytics
- Read replicas for reporting queries