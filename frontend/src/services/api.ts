import axios from 'axios';
import type {
  User,
  TrainingPlan,
  Workout,
  StravaActivity,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.error('🚫 401 Unauthorized - Token invalid or expired');
      console.error('Error details:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      
      // Only redirect if we're not already on login page and not during initial auth check
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/auth/callback') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },
};

// Plans API
export const plansApi = {
  getPlans: async (): Promise<TrainingPlan[]> => {
    const { data } = await api.get('/api/plans');
    return data;
  },

  getActivePlan: async (): Promise<TrainingPlan | null> => {
    const { data } = await api.get('/api/plans/active');
    return data;
  },

  getPlanById: async (id: string): Promise<TrainingPlan> => {
    const { data } = await api.get(`/api/plans/${id}`);
    return data;
  },

  getPlanWorkouts: async (
    id: string,
    params?: { weekNumber?: number; date?: string }
  ): Promise<Workout[]> => {
    const { data } = await api.get(`/api/plans/${id}/workouts`, { params });
    // Handle both array and object with data property
    const workouts = Array.isArray(data) ? data : (data?.data || []);
    return workouts.map((w: any) => normalizeWorkout(w)).filter((w: Workout | null): w is Workout => w !== null);
  },

  createPlan: async (plan: {
    name: string;
    raceDistance: number;
    raceDate: string;
    manualVDOT?: number;
    recentRaceDistance?: number;
    recentRaceTime?: number;
    trainingIntensity?: number;
    longRunsPerWeek?: number;
    availableDays?: string[];
    currentWeeklyMileage?: number;
  }): Promise<TrainingPlan> => {
    const { data } = await api.post('/api/plans', plan);
    return data;
  },

  deactivatePlan: async (id: string): Promise<TrainingPlan> => {
    const { data } = await api.patch(`/api/plans/${id}/deactivate`);
    return data;
  },
};

// Workouts API
export const workoutsApi = {
  getWorkoutById: async (id: string): Promise<Workout> => {
    const { data } = await api.get(`/api/workouts/${id}`);
    return normalizeWorkout(data) as Workout;
  },

  getWorkoutsByWeek: async (weekNumber: number): Promise<Workout[]> => {
    const { data } = await api.get(`/api/workouts/week/${weekNumber}`);
    // Handle both array and object with workouts property
    const workouts = Array.isArray(data) ? data : (data?.workouts || []);
    return workouts.map((w: any) => normalizeWorkout(w)).filter((w: Workout | null): w is Workout => w !== null);
  },

  getTodayWorkout: async (): Promise<Workout | null> => {
    const { data } = await api.get('/api/workouts/today');
    // Handle both response structures
    if (data.workout !== undefined) {
      // Wrapper structure: { message, workout, nextWorkout }
      return normalizeWorkout(data.workout);
    }
    // Direct workout object
    return normalizeWorkout(data);
  },

  completeWorkout: async (
    id: string,
    activityId?: string
  ): Promise<Workout> => {
    const { data} = await api.patch(`/api/workouts/${id}/complete`, {
      activityId,
    });
    return normalizeWorkout(data) as Workout;
  },

  uncompleteWorkout: async (id: string): Promise<Workout> => {
    const { data } = await api.patch(`/api/workouts/${id}/uncomplete`);
    return normalizeWorkout(data) as Workout;
  },
};

// Activities API
export const activitiesApi = {
  getActivities: async (params?: {
    page?: number;
    limit?: number;
    year?: number;
    month?: number;
    sportType?: string;
  }): Promise<{ activities: StravaActivity[]; total: number }> => {
    const { data } = await api.get('/api/activities', { params });
    return data;
  },

  getActivityById: async (id: string): Promise<StravaActivity> => {
    const { data } = await api.get(`/api/activities/${id}`);
    return data;
  },
};

// Strava API
export const stravaApi = {
  syncActivities: async (): Promise<{ synced: number; matched: number }> => {
    const { data } = await api.post('/api/strava/sync');
    return data;
  },

  getStravaActivity: async (id: string): Promise<any> => {
    const { data } = await api.get(`/api/strava/activities/${id}`);
    return data;
  },
};

// Helper to normalize workout response
function normalizeWorkout(workout: any): Workout | null {
  if (!workout) return null;
  return {
    ...workout,
    // Ensure dates are Date objects
    scheduledDate: new Date(workout.scheduledDate),
    completedAt: workout.completedAt ? new Date(workout.completedAt) : null,
    createdAt: new Date(workout.createdAt),
    updatedAt: new Date(workout.updatedAt),
  };
}

// Helper to check if workout is completed
export function isWorkoutCompleted(workout: Workout): boolean {
  return workout.completedAt !== null && workout.completedAt !== undefined;
}

export default api;
