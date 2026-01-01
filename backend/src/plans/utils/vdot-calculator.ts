/**
 * VDOT Calculator
 * Based on Jack Daniels' Running Formula
 */

export interface VDOTInput {
  distanceMeters: number;
  timeSeconds: number;
}

export class VDOTCalculator {
  /**
   * Calculate VDOT from race performance
   * Based on Jack Daniels' Running Formula (3rd Edition)
   */
  static calculateFromRace(input: VDOTInput): number {
    const { distanceMeters, timeSeconds } = input;

    // Velocity in meters per minute
    const velocity = (distanceMeters / timeSeconds) * 60;

    // Time in minutes
    const timeMinutes = timeSeconds / 60;

    // Calculate %VO2max using Jack Daniels' formula
    const percentVO2max =
      0.8 +
      0.1894393 * Math.exp(-0.012778 * timeMinutes) +
      0.2989558 * Math.exp(-0.1932605 * timeMinutes);

    // Calculate VO2 at race pace (ml/kg/min)
    const vo2 =
      -4.6 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);

    // Calculate VDOT
    const vdot = vo2 / percentVO2max;

    return Math.round(vdot * 10) / 10;
  }

  /**
   * Validate VDOT input
   */
  static validateInput(input: VDOTInput): boolean {
    return (
      input.distanceMeters >= 800 &&
      input.distanceMeters <= 42195 &&
      input.timeSeconds >= 120
    );
  }

  /**
   * Get equivalent race times for a given VDOT
   * Useful for displaying fitness equivalencies
   */
  static getEquivalentTimes(vdot: number): Record<string, number> {
    return {
      '5000': this.predictTime(vdot, 5000),
      '10000': this.predictTime(vdot, 10000),
      '21097': this.predictTime(vdot, 21097),
      '42195': this.predictTime(vdot, 42195),
    };
  }

  /**
   * Predict race time for a given VDOT and distance
   * Uses iterative approach to find time that yields this VDOT
   */
  private static predictTime(vdot: number, distanceMeters: number): number {
    let bestTime = 600;
    let minDiff = Infinity;
    const maxTime = (distanceMeters / 100) * 60;

    for (let time = 120; time <= maxTime; time += 10) {
      const calculatedVdot = this.calculateFromRace({
        distanceMeters,
        timeSeconds: time,
      });

      const diff = Math.abs(calculatedVdot - vdot);
      if (diff < minDiff) {
        minDiff = diff;
        bestTime = time;
      }
      if (diff < 0.1) break;
    }
    return bestTime;
  }
}
