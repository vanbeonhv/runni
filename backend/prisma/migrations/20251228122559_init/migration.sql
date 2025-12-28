-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "strava_athlete_id" BIGINT,
    "strava_access_token" TEXT,
    "strava_refresh_token" TEXT,
    "strava_token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "race_distance" INTEGER NOT NULL,
    "race_date" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "total_weeks" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" UUID NOT NULL,
    "training_plan_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "workout_type" VARCHAR(50) NOT NULL,
    "distance" INTEGER NOT NULL,
    "duration_estimate" INTEGER,
    "description" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_activities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "strava_activity_id" BIGINT NOT NULL,
    "name" VARCHAR(255),
    "sport_type" VARCHAR(50) NOT NULL,
    "distance" INTEGER NOT NULL,
    "moving_time" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL,
    "average_speed" DECIMAL(10,2),
    "average_heartrate" DECIMAL(10,2),
    "start_date_local" TIMESTAMP(3) NOT NULL,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strava_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_completions" (
    "id" UUID NOT NULL,
    "workout_id" UUID NOT NULL,
    "strava_activity_id" UUID NOT NULL,
    "matched_automatically" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_webhook_events" (
    "id" UUID NOT NULL,
    "strava_athlete_id" BIGINT,
    "object_type" VARCHAR(50) NOT NULL,
    "object_id" BIGINT NOT NULL,
    "aspect_type" VARCHAR(50) NOT NULL,
    "event_time" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_strava_athlete_id_key" ON "users"("strava_athlete_id");

-- CreateIndex
CREATE INDEX "users_strava_athlete_id_idx" ON "users"("strava_athlete_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "training_plans_user_id_idx" ON "training_plans"("user_id");

-- CreateIndex
CREATE INDEX "workouts_training_plan_id_idx" ON "workouts"("training_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_activities_strava_activity_id_key" ON "strava_activities"("strava_activity_id");

-- CreateIndex
CREATE INDEX "strava_activities_user_id_idx" ON "strava_activities"("user_id");

-- CreateIndex
CREATE INDEX "strava_activities_strava_activity_id_idx" ON "strava_activities"("strava_activity_id");

-- CreateIndex
CREATE INDEX "workout_completions_workout_id_idx" ON "workout_completions"("workout_id");

-- CreateIndex
CREATE INDEX "workout_completions_strava_activity_id_idx" ON "workout_completions"("strava_activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_completions_workout_id_strava_activity_id_key" ON "workout_completions"("workout_id", "strava_activity_id");

-- CreateIndex
CREATE INDEX "strava_webhook_events_strava_athlete_id_idx" ON "strava_webhook_events"("strava_athlete_id");

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_training_plan_id_fkey" FOREIGN KEY ("training_plan_id") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_activities" ADD CONSTRAINT "strava_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_strava_activity_id_fkey" FOREIGN KEY ("strava_activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
