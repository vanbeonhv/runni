import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  stravaAthleteId?: bigint;

  @IsOptional()
  @IsString()
  stravaAccessToken?: string;

  @IsOptional()
  @IsString()
  stravaRefreshToken?: string;

  @IsOptional()
  stravaTokenExpiresAt?: Date;
}
