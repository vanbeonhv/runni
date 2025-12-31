import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

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

  @IsOptional()
  @IsBoolean()
  hasCompletedInitialSync?: boolean;
}
