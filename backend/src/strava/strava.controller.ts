import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StravaService } from './strava.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/strava')
@UseGuards(JwtAuthGuard)
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Post('sync')
  async syncActivities(
    @CurrentUser() user: any,
    @Body('days') days?: number,
  ) {
    return this.stravaService.syncRecentActivities(user.userId, days || 7);
  }

  @Get('activities/:id')
  async getActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.stravaService.getActivity(id, user.userId);
  }
}
