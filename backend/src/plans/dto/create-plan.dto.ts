import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
  Min,
  IsOptional,
  IsNumber,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TrainingIntensity {
  LOW = 3, // 3 sessions per week
  MEDIUM = 4, // 4 sessions per week
  HIGH = 5, // 5 sessions per week
  VERY_HIGH = 6, // 6 sessions per week
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  raceDistance: number;

  @IsDateString()
  @IsNotEmpty()
  raceDate: string;

  // ==========================================
  // PHASE 1: Automated VDOT estimation (default mode)
  // ==========================================

  // Optional: Override automated VDOT calculation
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(85)
  manualVDOT?: number;

  // ==========================================
  // PHASE 2: Manual input (future)
  // ==========================================

  @IsOptional()
  @IsInt()
  @Min(1)
  recentRaceDistance?: number; // meters (e.g., 5000 for 5K)

  @IsOptional()
  @IsInt()
  @Min(1)
  recentRaceTime?: number; // seconds

  @IsOptional()
  @IsEnum(TrainingIntensity)
  @Type(() => Number)
  trainingIntensity?: TrainingIntensity; // Sessions per week (default: 4)

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  longRunsPerWeek?: number; // Typically 1

  @IsOptional()
  @IsString({ each: true })
  availableDays?: string[]; // ['monday', 'wednesday', 'friday', 'sunday']

  @IsOptional()
  @IsInt()
  @Min(0)
  currentWeeklyMileage?: number; // meters
}
