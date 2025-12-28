import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class StravaService {
  private readonly stravaApiUrl = 'https://www.strava.com/api/v3';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async refreshAccessToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stravaRefreshToken) {
      throw new UnauthorizedException('Strava authentication required');
    }

    // Check if token is still valid
    if (user.stravaTokenExpiresAt && new Date() < user.stravaTokenExpiresAt) {
      return user.stravaAccessToken!;
    }

    // Refresh the token
    try {
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: this.configService.get<string>('STRAVA_CLIENT_ID'),
        client_secret: this.configService.get<string>('STRAVA_CLIENT_SECRET'),
        grant_type: 'refresh_token',
        refresh_token: user.stravaRefreshToken,
      });

      // Update user with new tokens
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          stravaAccessToken: response.data.access_token,
          stravaRefreshToken: response.data.refresh_token,
          stravaTokenExpiresAt: new Date(response.data.expires_at * 1000),
        },
      });

      return response.data.access_token;
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh Strava token');
    }
  }

  async getActivity(activityId: number, userId: string) {
    const accessToken = await this.refreshAccessToken(userId);

    try {
      const response = await axios.get(
        `${this.stravaApiUrl}/activities/${activityId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException('Activity not found');
      }
      throw error;
    }
  }

  async getAthleteActivities(
    userId: string,
    after?: number,
    before?: number,
    page = 1,
    perPage = 30,
  ) {
    const accessToken = await this.refreshAccessToken(userId);

    try {
      const params: any = { page, per_page: perPage };
      if (after) params.after = after;
      if (before) params.before = before;

      const response = await axios.get(`${this.stravaApiUrl}/athlete/activities`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async syncRecentActivities(userId: string, days = 7) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    const stravaActivities = await this.getAthleteActivities(userId, after, undefined, 1, 200);

    let activitiesNew = 0;
    let activitiesUpdated = 0;

    for (const activity of stravaActivities) {
      const existing = await this.prisma.stravaActivity.findUnique({
        where: { stravaActivityId: BigInt(activity.id) },
      });

      const activityData = {
        userId,
        stravaActivityId: BigInt(activity.id),
        name: activity.name,
        sportType: activity.sport_type || activity.type,
        distance: Math.round(activity.distance),
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        averageSpeed: activity.average_speed,
        averageHeartrate: activity.average_heartrate,
        startDateLocal: new Date(activity.start_date_local),
        isManual: activity.manual || false,
        rawData: activity,
      };

      if (existing) {
        await this.prisma.stravaActivity.update({
          where: { id: existing.id },
          data: activityData,
        });
        activitiesUpdated++;
      } else {
        await this.prisma.stravaActivity.create({
          data: activityData,
        });
        activitiesNew++;

        // Try to auto-match with workouts
        await this.autoMatchActivity(userId, activity);
      }
    }

    return {
      message: 'Sync initiated',
      activitiesFound: stravaActivities.length,
      activitiesNew,
      activitiesUpdated,
    };
  }

  private async autoMatchActivity(userId: string, activity: any) {
    // Get active plan
    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!plan) return;

    // Extract activity date
    const activityDate = new Date(activity.start_date_local);
    activityDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(activityDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find workouts on the same date
    const candidates = await this.prisma.workout.findMany({
      where: {
        trainingPlanId: plan.id,
        scheduledDate: {
          gte: activityDate,
          lt: nextDay,
        },
        completedAt: null,
      },
    });

    if (candidates.length === 0) return;

    // Check if it's a running activity
    if (!activity.sport_type?.includes('Run') && !activity.type?.includes('Run')) {
      return;
    }

    // Match by distance (±10% tolerance)
    const activityDistance = Math.round(activity.distance);

    for (const workout of candidates) {
      const tolerance = 0.1;
      const lowerBound = workout.distance * (1 - tolerance);
      const upperBound = workout.distance * (1 + tolerance);

      if (activityDistance >= lowerBound && activityDistance <= upperBound) {
        // Get the stored activity
        const storedActivity = await this.prisma.stravaActivity.findUnique({
          where: { stravaActivityId: BigInt(activity.id) },
        });

        if (storedActivity) {
          // Create completion link
          await this.prisma.workoutCompletion.create({
            data: {
              workoutId: workout.id,
              stravaActivityId: storedActivity.id,
              matchedAutomatically: true,
            },
          });

          // Mark workout as completed
          await this.prisma.workout.update({
            where: { id: workout.id },
            data: {
              completedAt: new Date(activity.start_date_local),
            },
          });
        }

        break; // Only match to one workout
      }
    }
  }
}
