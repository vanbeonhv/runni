import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, userId: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: {
        trainingPlan: true,
        completions: {
          include: {
            stravaActivity: true,
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }

    if (workout.trainingPlan.userId !== userId) {
      throw new ForbiddenException('You do not have access to this workout');
    }

    return workout;
  }

  async findByWeek(userId: string, weekNumber: number) {
    // Get active plan
    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('No active training plan found');
    }

    const workouts = await this.prisma.workout.findMany({
      where: {
        trainingPlanId: plan.id,
        weekNumber,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const startDate = new Date(plan.startDate);
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const completed = workouts.filter((w) => w.completedAt !== null).length;
    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);

    return {
      weekNumber,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalWorkouts: workouts.length,
        completed,
        totalDistance,
      },
      workouts,
    };
  }

  async findToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('No active training plan found');
    }

    const workout = await this.prisma.workout.findFirst({
      where: {
        trainingPlanId: plan.id,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!workout) {
      // Find next workout
      const nextWorkout = await this.prisma.workout.findFirst({
        where: {
          trainingPlanId: plan.id,
          scheduledDate: {
            gte: tomorrow,
          },
        },
        orderBy: {
          scheduledDate: 'asc',
        },
      });

      return {
        message: 'No workout scheduled for today',
        nextWorkout,
      };
    }

    return workout;
  }

  async complete(id: string, userId: string, completeWorkoutDto: CompleteWorkoutDto) {
    const workout = await this.findOne(id, userId);

    if (workout.completedAt) {
      throw new ForbiddenException('Workout is already completed');
    }

    const updatedWorkout = await this.prisma.workout.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });

    // If stravaActivityId is provided, link it
    if (completeWorkoutDto.stravaActivityId) {
      await this.prisma.workoutCompletion.create({
        data: {
          workoutId: id,
          stravaActivityId: completeWorkoutDto.stravaActivityId,
          matchedAutomatically: false,
        },
      });
    }

    return updatedWorkout;
  }

  async uncomplete(id: string, userId: string) {
    const workout = await this.findOne(id, userId);

    if (!workout.completedAt) {
      throw new ForbiddenException('Workout is not completed');
    }

    // Remove all completions
    await this.prisma.workoutCompletion.deleteMany({
      where: { workoutId: id },
    });

    return this.prisma.workout.update({
      where: { id },
      data: {
        completedAt: null,
      },
    });
  }
}
