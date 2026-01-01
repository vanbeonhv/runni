-- AlterTable
ALTER TABLE "training_plans" ADD COLUMN     "ease_pace_max" INTEGER,
ADD COLUMN     "ease_pace_min" INTEGER,
ADD COLUMN     "interval_pace" INTEGER,
ADD COLUMN     "marathon_pace" INTEGER,
ADD COLUMN     "repetition_pace" INTEGER,
ADD COLUMN     "threshold_pace" INTEGER,
ADD COLUMN     "vdot" DECIMAL(4,1),
ADD COLUMN     "weekly_mileage" JSONB;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "pace_zone" VARCHAR(20),
ADD COLUMN     "structure" JSONB,
ADD COLUMN     "target_pace" INTEGER;
