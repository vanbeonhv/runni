import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(user.userId, createPlanDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.plansService.findAll(user.userId);
  }

  @Get('active')
  findActive(@CurrentUser() user: any) {
    return this.plansService.findActive(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plansService.findOne(id, user.userId);
  }

  @Get(':id/workouts')
  getWorkouts(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('weekNumber', new ParseIntPipe({ optional: true })) weekNumber?: number,
    @Query('completed', new ParseBoolPipe({ optional: true })) completed?: boolean,
  ) {
    return this.plansService.getWorkouts(id, user.userId, weekNumber, completed);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plansService.deactivate(id, user.userId);
  }
}
