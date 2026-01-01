import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { ActivitiesService } from '../activities/activities.service';

@Module({
  controllers: [PlansController],
  providers: [PlansService, ActivitiesService],
  exports: [PlansService],
})
export class PlansModule {}
