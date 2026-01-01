import { StravaActivity } from '@prisma/client';
import { PaceCalculator } from './pace-calculator';

/**
 * Activity Analyzer
 * Analyzes Strava activities to estimate runner's fitness level (VDOT)
 */

export interface ActivityAnalysis {
  vdot: number;
  averagePace: number;
  weeklyVolume: number;
  activityCount: number;
  longestRun: number;
}

export class ActivityAnalyzer {
  /**
   * Analyze recent activities to estimate VDOT
   * @param activities - Activities from last 4-8 weeks
   * @returns Activity analysis with estimated VDOT
   */
  static analyzeRecentActivities(
    activities: StravaActivity[],
  ): ActivityAnalysis {
    const validRuns = this.filterValidActivities(activities);

    if (validRuns.length < 3) {
      // Not enough data - return conservative defaults
      return {
        vdot: 40,
        averagePace: 360, // 6:00/km
        weeklyVolume: 20000, // 20km
        activityCount: 0,
        longestRun: 5000,
      };
    }

    // Calculate average pace (weighted by distance)
    const totalDistance = validRuns.reduce((sum, a) => sum + a.distance, 0);
    const weightedPaceSum = validRuns.reduce((sum, activity) => {
      const pace = activity.movingTime / (activity.distance / 1000);
      return sum + pace * activity.distance;
    }, 0);
    const averagePace = weightedPaceSum / totalDistance;

    // Estimate VDOT from average easy pace
    const vdot = this.estimateVDOTFromEasyPace(averagePace);

    // Calculate weekly volume (average over the period)
    const weeks = this.calculateWeeksCovered(validRuns);
    const weeklyVolume = totalDistance / weeks;

    // Find longest run
    const longestRun = Math.max(...validRuns.map((a) => a.distance));

    return {
      vdot,
      averagePace,
      weeklyVolume,
      activityCount: validRuns.length,
      longestRun,
    };
  }

  /**
   * Filter out invalid activities
   */
  private static filterValidActivities(
    activities: StravaActivity[],
  ): StravaActivity[] {
    return activities.filter((activity) => {
      // Must be a run
      if (activity.sportType !== 'Run') return false;

      // Exclude manual entries (often inaccurate)
      if (activity.isManual) return false;

      // Must be at least 2km
      if (activity.distance < 2000) return false;

      // Must be at least 10 minutes
      if (activity.movingTime < 600) return false;

      // Must have valid speed data
      if (!activity.averageSpeed || activity.averageSpeed.toNumber() <= 0)
        return false;

      // Exclude very slow runs (walking pace: >8:00/km)
      const paceSecsPerKm = activity.movingTime / (activity.distance / 1000);
      if (paceSecsPerKm > 480) return false;

      // Exclude very fast runs (likely data errors: <3:00/km)
      if (paceSecsPerKm < 180) return false;

      return true;
    });
  }

  /**
   * Estimate VDOT from easy pace
   * Assumes the average pace represents easy runs (~65% vVO2max)
   */
  private static estimateVDOTFromEasyPace(easyPaceSecsPerKm: number): number {
    let bestVdot = 40;
    let minDiff = Infinity;

    // Search VDOT range
    for (let vdot = 30; vdot <= 85; vdot += 0.5) {
      const paces = PaceCalculator.calculateTrainingPaces(vdot);
      const easyPaceMid = (paces.easy.min + paces.easy.max) / 2;

      const diff = Math.abs(easyPaceMid - easyPaceSecsPerKm);
      if (diff < minDiff) {
        minDiff = diff;
        bestVdot = vdot;
      }
    }

    return bestVdot;
  }

  /**
   * Calculate how many weeks are covered by the activities
   */
  private static calculateWeeksCovered(
    activities: StravaActivity[],
  ): number {
    if (activities.length === 0) return 1;

    const dates = activities.map((a) =>
      new Date(a.startDateLocal).getTime(),
    );
    const earliest = Math.min(...dates);
    const latest = Math.max(...dates);

    const weeks = (latest - earliest) / (7 * 24 * 60 * 60 * 1000);
    return Math.max(1, Math.ceil(weeks));
  }

  /**
   * Find recent races (heuristic: faster than average pace + race distance)
   */
  static findRecentRaces(
    activities: StravaActivity[],
  ): StravaActivity[] {
    const validRuns = this.filterValidActivities(activities);
    if (validRuns.length < 5) return [];

    // Calculate average pace
    const avgPace =
      validRuns.reduce((sum, a) => {
        return sum + a.movingTime / (a.distance / 1000);
      }, 0) / validRuns.length;

    // Races are typically:
    // 1. Significantly faster than average
    // 2. Common race distances (5K, 10K, HM, Marathon)
    return validRuns.filter((activity) => {
      const pace = activity.movingTime / (activity.distance / 1000);
      const isFasterThanAverage = pace < avgPace * 0.85;

      const isRaceDistance =
        Math.abs(activity.distance - 5000) < 200 ||
        Math.abs(activity.distance - 10000) < 200 ||
        Math.abs(activity.distance - 21097) < 500 ||
        Math.abs(activity.distance - 42195) < 500;

      return isFasterThanAverage && isRaceDistance;
    });
  }
}
