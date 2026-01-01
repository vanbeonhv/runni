export type Step = 'distance' | 'raceDate' | 'name' | 'choice' | 'generating';

export interface PlanFormData {
  name: string;
  raceDistance: number;
  raceDate: string;
}

