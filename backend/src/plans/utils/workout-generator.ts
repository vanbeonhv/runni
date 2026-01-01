import { TrainingPaces } from './pace-calculator';

/**
 * Workout Generator
 * Generates structured workouts with proper periodization
 * Based on Jack Daniels' training methodology
 */

export interface WorkoutSegment {
  type: 'continuous' | 'interval';
  distance?: number;
  pace: 'easy' | 'marathon' | 'threshold' | 'interval' | 'repetition';
  repetitions?: number;
  recovery?: {
    distance?: number;
    pace: string;
  };
  description?: string;
}

export interface WorkoutStructure {
  warmup?: WorkoutSegment[];
  main: WorkoutSegment[];
  cooldown?: WorkoutSegment[];
}

export interface GeneratedWorkout {
  workoutType: string;
  distance: number;
  durationEstimate: number;
  description: string;
  targetPace: number;
  paceZone: string;
  structure: WorkoutStructure;
}

export enum TrainingPhase {
  BASE = 'base',
  BUILD = 'build',
  PEAK = 'peak',
  TAPER = 'taper',
}

export class WorkoutGenerator {
  /**
   * Generate a week of workouts based on phase and VDOT
   */
  static generateWeek(
    weekNumber: number,
    totalWeeks: number,
    raceDistance: number,
    paces: TrainingPaces,
    sessionsPerWeek: number = 4,
  ): GeneratedWorkout[] {
    const phase = this.determinePhase(weekNumber, totalWeeks);
    const isRecoveryWeek = weekNumber % 4 === 0; // Every 4th week is recovery

    const workouts: GeneratedWorkout[] = [];

    // Long run (every week)
    workouts.push(
      this.generateLongRun(
        weekNumber,
        totalWeeks,
        raceDistance,
        paces,
        isRecoveryWeek,
      ),
    );

    // Workout day (speed/tempo)
    if (sessionsPerWeek >= 3) {
      workouts.push(this.generateQualityWorkout(phase, paces, isRecoveryWeek));
    }

    // Easy runs to fill remaining days
    const easyRunCount = sessionsPerWeek - workouts.length;
    for (let i = 0; i < easyRunCount; i++) {
      workouts.push(this.generateEasyRun(paces, isRecoveryWeek));
    }

    return workouts;
  }

  /**
   * Determine training phase based on week number
   */
  private static determinePhase(
    weekNumber: number,
    totalWeeks: number,
  ): TrainingPhase {
    const progress = weekNumber / totalWeeks;

    if (progress < 0.4) return TrainingPhase.BASE;
    if (progress < 0.75) return TrainingPhase.BUILD;
    if (progress < 0.9) return TrainingPhase.PEAK;
    return TrainingPhase.TAPER;
  }

  /**
   * Generate long run workout
   */
  private static generateLongRun(
    weekNumber: number,
    totalWeeks: number,
    raceDistance: number,
    paces: TrainingPaces,
    isRecoveryWeek: boolean,
  ): GeneratedWorkout {
    const phase = this.determinePhase(weekNumber, totalWeeks);
    const progress = weekNumber / totalWeeks;

    let distance: number;

    if (phase === TrainingPhase.TAPER) {
      // Taper: reduce long run distance
      distance = Math.round(raceDistance * 0.4);
    } else {
      // Build up to 50-75% of race distance
      const targetPercent = raceDistance >= 42195 ? 0.5 : 0.75;
      distance = Math.round(
        raceDistance * targetPercent * Math.min(1, progress * 1.5),
      );
    }

    if (isRecoveryWeek) {
      distance = Math.round(distance * 0.75);
    }

    // Ensure minimum distance
    distance = Math.max(8000, distance);

    const structure: WorkoutStructure = {
      main: [
        {
          type: 'continuous',
          distance,
          pace: 'easy',
          description: 'Long steady run at easy pace',
        },
      ],
    };

    const easyPace = (paces.easy.min + paces.easy.max) / 2;
    const duration = Math.round((distance / 1000) * easyPace);

    return {
      workoutType: 'Long Run',
      distance,
      durationEstimate: duration,
      description: `Long run - ${(distance / 1000).toFixed(1)}km at easy pace`,
      targetPace: Math.round(easyPace),
      paceZone: 'easy',
      structure,
    };
  }

  /**
   * Generate quality workout (intervals/tempo)
   */
  private static generateQualityWorkout(
    phase: TrainingPhase,
    paces: TrainingPaces,
    isRecoveryWeek: boolean,
  ): GeneratedWorkout {
    if (isRecoveryWeek) {
      // Recovery week: easy tempo
      return this.generateTempoRun(6000, paces, true);
    }

    switch (phase) {
      case TrainingPhase.BASE:
        // Base phase: threshold runs
        return this.generateTempoRun(8000, paces, false);

      case TrainingPhase.BUILD:
        // Build phase: mix of tempo and intervals
        return Math.random() > 0.5
          ? this.generateTempoRun(10000, paces, false)
          : this.generateIntervalWorkout(paces, 1000, 5);

      case TrainingPhase.PEAK:
        // Peak phase: race-specific intervals
        return this.generateIntervalWorkout(paces, 1000, 6);

      case TrainingPhase.TAPER:
        // Taper: short, sharp intervals
        return this.generateIntervalWorkout(paces, 400, 4);
    }
  }

  /**
   * Generate tempo/threshold run
   */
  private static generateTempoRun(
    tempoDistance: number,
    paces: TrainingPaces,
    isEasyTempo: boolean,
  ): GeneratedWorkout {
    const warmupDistance = 2000;
    const cooldownDistance = 1000;
    const totalDistance = warmupDistance + tempoDistance + cooldownDistance;

    const pace = isEasyTempo ? paces.marathon : paces.threshold;
    const paceZone = isEasyTempo ? 'marathon' : 'threshold';

    const structure: WorkoutStructure = {
      warmup: [{ type: 'continuous', distance: warmupDistance, pace: 'easy' }],
      main: [
        {
          type: 'continuous',
          distance: tempoDistance,
          pace: paceZone as any,
          description: `${(tempoDistance / 1000).toFixed(1)}km at ${paceZone} pace`,
        },
      ],
      cooldown: [
        { type: 'continuous', distance: cooldownDistance, pace: 'easy' },
      ],
    };

    const easyPace = (paces.easy.min + paces.easy.max) / 2;
    const duration =
      Math.round((warmupDistance / 1000) * easyPace) +
      Math.round((tempoDistance / 1000) * pace) +
      Math.round((cooldownDistance / 1000) * easyPace);

    return {
      workoutType: 'Tempo Run',
      distance: totalDistance,
      durationEstimate: duration,
      description: `2km warmup + ${(tempoDistance / 1000).toFixed(1)}km @ ${paceZone} + 1km cooldown`,
      targetPace: pace,
      paceZone,
      structure,
    };
  }

  /**
   * Generate interval workout
   */
  private static generateIntervalWorkout(
    paces: TrainingPaces,
    intervalDistance: number,
    repetitions: number,
  ): GeneratedWorkout {
    const warmupDistance = 2000;
    const cooldownDistance = 1000;
    const recoveryDistance = Math.round(intervalDistance * 0.5);

    const totalIntervalDistance = intervalDistance * repetitions;
    const totalRecoveryDistance = recoveryDistance * (repetitions - 1);
    const totalDistance =
      warmupDistance +
      totalIntervalDistance +
      totalRecoveryDistance +
      cooldownDistance;

    const structure: WorkoutStructure = {
      warmup: [{ type: 'continuous', distance: warmupDistance, pace: 'easy' }],
      main: [
        {
          type: 'interval',
          distance: intervalDistance,
          pace: 'interval',
          repetitions,
          recovery: {
            distance: recoveryDistance,
            pace: 'easy',
          },
          description: `${repetitions}x${intervalDistance}m @ interval pace with ${recoveryDistance}m recovery`,
        },
      ],
      cooldown: [
        { type: 'continuous', distance: cooldownDistance, pace: 'easy' },
      ],
    };

    const easyPace = (paces.easy.min + paces.easy.max) / 2;
    const duration =
      Math.round((warmupDistance / 1000) * easyPace) +
      Math.round((totalIntervalDistance / 1000) * paces.interval) +
      Math.round((totalRecoveryDistance / 1000) * easyPace) +
      Math.round((cooldownDistance / 1000) * easyPace);

    return {
      workoutType: 'Intervals',
      distance: totalDistance,
      durationEstimate: duration,
      description: `2km warmup + ${repetitions}x${intervalDistance}m @ interval pace + 1km cooldown`,
      targetPace: paces.interval,
      paceZone: 'interval',
      structure,
    };
  }

  /**
   * Generate easy run
   */
  private static generateEasyRun(
    paces: TrainingPaces,
    isRecoveryWeek: boolean,
  ): GeneratedWorkout {
    const baseDistance = isRecoveryWeek ? 6000 : 8000;
    const distance = baseDistance + Math.round(Math.random() * 2000);

    const structure: WorkoutStructure = {
      main: [
        {
          type: 'continuous',
          distance,
          pace: 'easy',
          description: 'Easy conversational pace',
        },
      ],
    };

    const easyPace = (paces.easy.min + paces.easy.max) / 2;
    const duration = Math.round((distance / 1000) * easyPace);

    return {
      workoutType: 'Easy Run',
      distance,
      durationEstimate: duration,
      description: `Easy run - ${(distance / 1000).toFixed(1)}km at comfortable pace`,
      targetPace: Math.round(easyPace),
      paceZone: 'easy',
      structure,
    };
  }
}
