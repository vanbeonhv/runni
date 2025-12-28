import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    year?: number,
    month?: number,
    sportType?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (year || month) {
      const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1);
      const endDate = new Date(year || new Date().getFullYear(), month !== undefined ? month : 12, 0);

      where.startDateLocal = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (sportType) {
      where.sportType = sportType;
    }

    const [activities, total] = await Promise.all([
      this.prisma.stravaActivity.findMany({
        where,
        include: {
          completions: {
            include: {
              workout: {
                select: {
                  id: true,
                  workoutType: true,
                  scheduledDate: true,
                },
              },
            },
          },
        },
        orderBy: { startDateLocal: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stravaActivity.count({ where }),
    ]);

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const activity = await this.prisma.stravaActivity.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        completions: {
          include: {
            workout: {
              select: {
                id: true,
                workoutType: true,
                distance: true,
                scheduledDate: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }
}
