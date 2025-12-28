import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StravaService } from '../strava/strava.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private stravaService: StravaService,
  ) {}

  async handleWebhookEvent(payload: any) {
    this.logger.log(`Received webhook event: ${JSON.stringify(payload)}`);

    // Store the event
    const event = await this.prisma.stravaWebhookEvent.create({
      data: {
        stravaAthleteId: payload.owner_id ? BigInt(payload.owner_id) : null,
        objectType: payload.object_type,
        objectId: BigInt(payload.object_id),
        aspectType: payload.aspect_type,
        eventTime: new Date(payload.event_time * 1000),
        rawPayload: payload,
      },
    });

    // Process asynchronously
    this.processEvent(event.id).catch((error) => {
      this.logger.error(`Failed to process event ${event.id}:`, error);
    });

    return { message: 'Event received' };
  }

  private async processEvent(eventId: string) {
    const event = await this.prisma.stravaWebhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.processed) {
      return;
    }

    try {
      // Only process activity events
      if (event.objectType !== 'activity') {
        await this.prisma.stravaWebhookEvent.update({
          where: { id: eventId },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });
        return;
      }

      // Find the user by athlete ID
      const user = event.stravaAthleteId ? await this.prisma.user.findUnique({
        where: { stravaAthleteId: event.stravaAthleteId },
      }) : null;

      if (!user) {
        this.logger.warn(`User not found for athlete ID: ${event.stravaAthleteId}`);
        await this.prisma.stravaWebhookEvent.update({
          where: { id: eventId },
          data: {
            processed: true,
            processedAt: new Date(),
            errorMessage: 'User not found',
          },
        });
        return;
      }

      // Handle different aspect types
      if (event.aspectType === 'create' || event.aspectType === 'update') {
        // Fetch activity details from Strava
        const activityData = await this.stravaService.getActivity(
          Number(event.objectId),
          user.id,
        );

        // Check if activity already exists
        const existing = await this.prisma.stravaActivity.findUnique({
          where: { stravaActivityId: event.objectId },
        });

        const activityPayload = {
          userId: user.id,
          stravaActivityId: event.objectId,
          name: activityData.name,
          sportType: activityData.sport_type || activityData.type,
          distance: Math.round(activityData.distance),
          movingTime: activityData.moving_time,
          elapsedTime: activityData.elapsed_time,
          averageSpeed: activityData.average_speed,
          averageHeartrate: activityData.average_heartrate,
          startDateLocal: new Date(activityData.start_date_local),
          isManual: activityData.manual || false,
          rawData: activityData,
        };

        if (existing) {
          // Update existing activity
          await this.prisma.stravaActivity.update({
            where: { id: existing.id },
            data: activityPayload,
          });
        } else {
          // Create new activity
          await this.prisma.stravaActivity.create({
            data: activityPayload,
          });

          // Try to auto-match with workouts
          await this.autoMatchActivity(user.id, activityData);
        }
      } else if (event.aspectType === 'delete') {
        // Delete the activity
        const activity = await this.prisma.stravaActivity.findUnique({
          where: { stravaActivityId: event.objectId },
        });

        if (activity) {
          // This will cascade delete workout completions
          await this.prisma.stravaActivity.delete({
            where: { id: activity.id },
          });
        }
      }

      // Mark event as processed
      await this.prisma.stravaWebhookEvent.update({
        where: { id: eventId },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      this.logger.log(`Successfully processed event ${eventId}`);
    } catch (error) {
      this.logger.error(`Error processing event ${eventId}:`, error);

      await this.prisma.stravaWebhookEvent.update({
        where: { id: eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async autoMatchActivity(userId: string, activity: any) {
    const plan = await this.prisma.trainingPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!plan) return;

    const activityDate = new Date(activity.start_date_local);
    activityDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(activityDate);
    nextDay.setDate(nextDay.getDate() + 1);

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

    if (!activity.sport_type?.includes('Run') && !activity.type?.includes('Run')) {
      return;
    }

    const activityDistance = Math.round(activity.distance);

    for (const workout of candidates) {
      const tolerance = 0.1;
      const lowerBound = workout.distance * (1 - tolerance);
      const upperBound = workout.distance * (1 + tolerance);

      if (activityDistance >= lowerBound && activityDistance <= upperBound) {
        const storedActivity = await this.prisma.stravaActivity.findUnique({
          where: { stravaActivityId: BigInt(activity.id) },
        });

        if (storedActivity) {
          await this.prisma.workoutCompletion.create({
            data: {
              workoutId: workout.id,
              stravaActivityId: storedActivity.id,
              matchedAutomatically: true,
            },
          });

          await this.prisma.workout.update({
            where: { id: workout.id },
            data: {
              completedAt: new Date(activity.start_date_local),
            },
          });
        }

        break;
      }
    }
  }
}
