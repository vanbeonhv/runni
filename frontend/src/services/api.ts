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
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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
    return data;
  },

  createPlan: async (plan: {
    name: string;
    raceDistance: number;
    raceDate: string;
    startDate: string;
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
    return data;
  },

  getWorkoutsByWeek: async (weekNumber: number): Promise<Workout[]> => {
    const { data } = await api.get(`/api/workouts/week/${weekNumber}`);
    return data;
  },

  getTodayWorkout: async (): Promise<Workout | null> => {
    const { data } = await api.get('/api/workouts/today');
    return data;
  },

  completeWorkout: async (
    id: string,
    activityId?: string
  ): Promise<Workout> => {
    const { data} = await api.patch(`/api/workouts/${id}/complete`, {
      activityId,
    });
    return data;
  },

  uncompleteWorkout: async (id: string): Promise<Workout> => {
    const { data } = await api.patch(`/api/workouts/${id}/uncomplete`);
    return data;
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

export default api;
