import { IsNotEmpty, IsString, IsInt, IsDateString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  raceDistance: number;

  @IsDateString()
  @IsNotEmpty()
  raceDate: string;
}
