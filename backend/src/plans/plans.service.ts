import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

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

    // Create new plan
    const plan = await this.prisma.trainingPlan.create({
      data: {
        userId,
        name: createPlanDto.name,
        raceDistance: createPlanDto.raceDistance,
        raceDate,
        startDate,
        totalWeeks,
        isActive: true,
      },
    });

    // Generate workouts for the plan
    await this.generateWorkouts(plan.id, startDate, totalWeeks, createPlanDto.raceDistance);

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
      throw new NotFoundException('No active training plan found');
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
  ) {
    const workouts: any[] = [];
    const workoutTypes = ['Easy', 'Long', 'Intervals', 'Tempo', 'Recovery'];

    for (let week = 1; week <= totalWeeks; week++) {
      // 3 workouts per week
      const daysInWeek = [1, 3, 6]; // Monday, Wednesday, Saturday

      for (let i = 0; i < daysInWeek.length; i++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(scheduledDate.getDate() + (week - 1) * 7 + daysInWeek[i]);

        const workoutType = i === 2 ? 'Long' : workoutTypes[i % workoutTypes.length];
        const distance = this.calculateWorkoutDistance(week, totalWeeks, raceDistance, workoutType);

        workouts.push({
          trainingPlanId: planId,
          weekNumber: week,
          scheduledDate,
          workoutType,
          distance,
          durationEstimate: Math.round((distance / 1000) * 6), // ~6 min/km pace estimate
          description: this.getWorkoutDescription(workoutType, distance),
        });
      }
    }

    await this.prisma.workout.createMany({ data: workouts });
  }

  private calculateWorkoutDistance(
    week: number,
    totalWeeks: number,
    raceDistance: number,
    workoutType: string,
  ): number {
    const progressFactor = week / totalWeeks;

    if (workoutType === 'Long') {
      return Math.round(raceDistance * 0.5 * (0.5 + progressFactor * 0.5));
    } else if (workoutType === 'Tempo') {
      return Math.round(raceDistance * 0.3);
    } else if (workoutType === 'Intervals') {
      return Math.round(raceDistance * 0.25);
    } else {
      return Math.round(raceDistance * 0.3);
    }
  }

  private getWorkoutDescription(workoutType: string, distance: number): string {
    const km = (distance / 1000).toFixed(1);
    const descriptions: Record<string, string> = {
      Easy: `Easy pace run - ${km}km at comfortable pace`,
      Long: `Long run - ${km}km at steady pace`,
      Intervals: `Interval training - ${km}km with speed intervals`,
      Tempo: `Tempo run - ${km}km at threshold pace`,
      Recovery: `Recovery run - ${km}km easy pace`,
    };
    return descriptions[workoutType] || `${workoutType} - ${km}km`;
  }
}
