import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutsService.findOne(id, user.userId);
  }

  @Get('week/:weekNumber')
  findByWeek(
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
    @CurrentUser() user: any,
  ) {
    return this.workoutsService.findByWeek(user.userId, weekNumber);
  }

  @Get('today')
  findToday(@CurrentUser() user: any) {
    return this.workoutsService.findToday(user.userId);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() completeWorkoutDto: CompleteWorkoutDto,
  ) {
    return this.workoutsService.complete(id, user.userId, completeWorkoutDto);
  }

  @Patch(':id/uncomplete')
  uncomplete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutsService.uncomplete(id, user.userId);
  }
}
