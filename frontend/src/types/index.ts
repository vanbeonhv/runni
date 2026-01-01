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
  planId: string;
  weekNumber: number;
  dayOfWeek: number;
  date: Date;
  type: 'EASY' | 'TEMPO' | 'LONG' | 'INTERVALS' | 'RECOVERY';
  distance: number;
  duration?: number;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
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
