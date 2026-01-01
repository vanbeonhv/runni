import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { VDOTCalculator } from './utils/vdot-calculator';
import { PaceCalculator, TrainingPaces } from './utils/pace-calculator';
import { ActivityAnalyzer } from './utils/activity-analyzer';
import { WorkoutGenerator } from './utils/workout-generator';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async create(userId: string, createPlanDto: CreatePlanDto) {
    const raceDate = new Date(createPlanDto.raceDate);
    const today = new Date();

    if (raceDate <= today) {
      throw new BadRequestException('Race date must be in the future');
    }

    // Calculate plan duration based on race distance
    const totalWeeks = this.calculatePlanDuration(createPlanDto.raceDistance);
    const startDate = new Date(raceDate);
    startDate.setDate(startDate.getDate() - totalWeeks * 7);

    // ==========================================
    // VDOT Calculation (Priority-based)
    // ==========================================
    let vdot: number;
    let vdotSource: string;

    if (createPlanDto.manualVDOT) {
      // Priority 1: Manual VDOT override
      vdot = createPlanDto.manualVDOT;
      vdotSource = 'manual';
      this.logger.log(`Using manual VDOT: ${vdot}`);
    } else if (createPlanDto.recentRaceDistance && createPlanDto.recentRaceTime) {
      // Priority 2: Calculate from recent race performance
      vdot = VDOTCalculator.calculateFromRace({
        distanceMeters: createPlanDto.recentRaceDistance,
        timeSeconds: createPlanDto.recentRaceTime,
      });
      vdotSource = 'race';
      this.logger.log(`Calculated VDOT from race: ${vdot} (${createPlanDto.recentRaceDistance}m in ${createPlanDto.recentRaceTime}s)`);
    } else {
      // Priority 3: Estimate from recent activities
      const recentActivities = await this.activitiesService.findRecentForVDOT(userId, 6);
      const analysis = ActivityAnalyzer.analyzeRecentActivities(recentActivities);
      vdot = analysis.vdot;
      vdotSource = 'activities';
      this.logger.log(
        `Estimated VDOT from ${analysis.activityCount} activities: ${vdot} ` +
        `(avg pace: ${Math.round(analysis.averagePace)}s/km, weekly: ${Math.round(analysis.weeklyVolume / 1000)}km)`
      );
    }

    // Calculate training paces from VDOT
    const paces = PaceCalculator.calculateTrainingPaces(vdot);
    this.logger.log(
      `Training paces - Easy: ${PaceCalculator.formatPace((paces.easy.min + paces.easy.max) / 2)}/km, ` +
      `Marathon: ${PaceCalculator.formatPace(paces.marathon)}/km, ` +
      `Threshold: ${PaceCalculator.formatPace(paces.threshold)}/km, ` +
      `Interval: ${PaceCalculator.formatPace(paces.interval)}/km`
    );

    // Deactivate any existing active plans
    await this.prisma.trainingPlan.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new plan with VDOT and training paces
    const plan = await this.prisma.trainingPlan.create({
      data: {
        userId,
        name: createPlanDto.name,
        raceDistance: createPlanDto.raceDistance,
        raceDate,
        startDate,
        totalWeeks,
        isActive: true,
        // VDOT and training paces
        vdot,
        easePaceMin: paces.easy.min,
        easePaceMax: paces.easy.max,
        marathonPace: paces.marathon,
        thresholdPace: paces.threshold,
        intervalPace: paces.interval,
        repetitionPace: paces.repetition,
      },
    });

    // Generate workouts with VDOT-based paces and periodization
    const sessionsPerWeek = createPlanDto.trainingIntensity || 4;
    await this.generateWorkouts(
      plan.id,
      startDate,
      totalWeeks,
      createPlanDto.raceDistance,
      paces,
      sessionsPerWeek,
    );

    this.logger.log(`Created training plan ${plan.id} for user ${userId} with VDOT ${vdot} (source: ${vdotSource})`);

    return plan;
  }

  async findAll(userId: string) {
    return this.prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(userId: string) {
    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!plan) {
      return null;
    }

    return plan;
  }

  async findOne(id: string, userId: string) {
    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        workouts: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Training plan with ID ${id} not found`);
    }

    return plan;
  }

  async getWorkouts(id: string, userId: string, weekNumber?: number, completed?: boolean) {
    const plan = await this.prisma.trainingPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new NotFoundException(`Training plan with ID ${id} not found`);
    }

    const where: any = { trainingPlanId: id };

    if (weekNumber !== undefined) {
      where.weekNumber = weekNumber;
    }

    if (completed !== undefined) {
      where.completedAt = completed ? { not: null } : null;
    }

    const workouts = await this.prisma.workout.findMany({
      where,
      include: {
        completions: {
          include: {
            stravaActivity: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return {
      data: workouts,
      total: workouts.length,
      weekNumber,
    };
  }

  async deactivate(id: string, userId: string) {
    const plan = await this.prisma.trainingPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new NotFoundException(`Training plan with ID ${id} not found`);
    }

    return this.prisma.trainingPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private calculatePlanDuration(raceDistance: number): number {
    // Simple logic: HM = 12 weeks, Marathon = 16 weeks, 10K = 8 weeks
    if (raceDistance >= 40000) return 16; // Marathon
    if (raceDistance >= 20000) return 12; // Half Marathon
    if (raceDistance >= 10000) return 8;  // 10K
    return 6; // 5K
  }

  private async generateWorkouts(
    planId: string,
    startDate: Date,
    totalWeeks: number,
    raceDistance: number,
    paces: TrainingPaces,
    sessionsPerWeek: number = 4,
  ) {
    const workouts: any[] = [];

    // Default day distribution based on sessions per week
    // This distributes workouts throughout the week
    const dayDistributions: Record<number, number[]> = {
      3: [0, 3, 6],          // Mon, Thu, Sun
      4: [0, 2, 4, 6],       // Mon, Wed, Fri, Sun
      5: [0, 2, 3, 5, 6],    // Mon, Wed, Thu, Sat, Sun
      6: [0, 1, 2, 4, 5, 6], // Mon, Tue, Wed, Fri, Sat, Sun
    };

    const daysInWeek = dayDistributions[sessionsPerWeek] || dayDistributions[4];

    for (let week = 1; week <= totalWeeks; week++) {
      // Generate workouts for this week using WorkoutGenerator
      const generatedWorkouts = WorkoutGenerator.generateWeek(
        week,
        totalWeeks,
        raceDistance,
        paces,
        sessionsPerWeek,
      );

      // Schedule workouts on specific days
      generatedWorkouts.forEach((workout, index) => {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(
          scheduledDate.getDate() + (week - 1) * 7 + daysInWeek[index]
        );

        workouts.push({
          trainingPlanId: planId,
          weekNumber: week,
          scheduledDate,
          workoutType: workout.workoutType,
          distance: workout.distance,
          durationEstimate: workout.durationEstimate,
          description: workout.description,
          targetPace: workout.targetPace,
          paceZone: workout.paceZone,
          structure: workout.structure,
        });
      });
    }

    await this.prisma.workout.createMany({ data: workouts });
    this.logger.log(`Generated ${workouts.length} workouts for plan ${planId} (${sessionsPerWeek} sessions/week)`);
  }

}
