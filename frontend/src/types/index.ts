export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  stravaAthleteId?: bigint;
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  raceDistance: number;
  raceDate: Date;
  startDate: Date;
  weeks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  workouts?: Workout[];
}

export interface Workout {
  id: string;
  trainingPlanId: string;
  weekNumber: number;
  scheduledDate: Date;
  workoutType: string;
  distance: number;
  durationEstimate?: number;
  description?: string;
  targetPace?: number;
  paceZone?: string;
  structure?: any;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completion?: WorkoutCompletion;
}

export interface StravaActivity {
  id: string;
  userId: string;
  stravaActivityId: bigint;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  sportType: string;
  startDateLocal: Date;
  timezone: string;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  createdAt: Date;
  updatedAt: Date;
  completions?: WorkoutCompletion[];
}

export interface WorkoutCompletion {
  id: string;
  workoutId: string;
  activityId: string;
  createdAt: Date;
  workout?: Workout;
  activity?: StravaActivity;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WeekSummary {
  weekNumber: number;
  totalDistance: number;
  completedWorkouts: number;
  totalWorkouts: number;
}
