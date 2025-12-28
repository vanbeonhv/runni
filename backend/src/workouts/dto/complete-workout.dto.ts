import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CompleteWorkoutDto {
  @IsOptional()
  @IsUUID()
  stravaActivityId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
