/**
 * Pace Calculator
 * Calculates training paces from VDOT based on Jack Daniels' methodology
 */

export interface TrainingPaces {
  easy: { min: number; max: number };
  marathon: number;
  threshold: number;
  interval: number;
  repetition: number;
}

export class PaceCalculator {
  /**
   * Calculate all training paces from VDOT
   * @param vdot - VDOT value (typically 30-85)
   * @returns Paces in seconds per kilometer
   */
  static calculateTrainingPaces(vdot: number): TrainingPaces {
    // Velocity at VO2max (meters per minute)
    const vVO2max = 29.54 + 5.000663 * vdot - 0.007546 * Math.pow(vdot, 2);

    // Easy: 59-74% of vVO2max (use range)
    const easyMin = 60000 / (vVO2max * 0.74); // Faster easy pace
    const easyMax = 60000 / (vVO2max * 0.59); // Slower easy pace

    // Marathon: ~80% of vVO2max
    const marathon = 60000 / (vVO2max * 0.8);

    // Threshold: ~85% of vVO2max
    const threshold = 60000 / (vVO2max * 0.85);

    // Interval: ~98% of vVO2max
    const interval = 60000 / (vVO2max * 0.98);

    // Repetition: ~110% of vVO2max
    const repetition = 60000 / (vVO2max * 1.1);

    return {
      easy: { min: Math.round(easyMin), max: Math.round(easyMax) },
      marathon: Math.round(marathon),
      threshold: Math.round(threshold),
      interval: Math.round(interval),
      repetition: Math.round(repetition),
    };
  }

  /**
   * Format pace as MM:SS per km
   */
  static formatPace(secondsPerKm: number): string {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate duration for a workout segment
   * @param distanceMeters - Distance in meters
   * @param paceSecsPerKm - Pace in seconds per kilometer
   * @returns Duration in seconds
   */
  static calculateDuration(
    distanceMeters: number,
    paceSecsPerKm: number,
  ): number {
    return Math.round((distanceMeters / 1000) * paceSecsPerKm);
  }
}
