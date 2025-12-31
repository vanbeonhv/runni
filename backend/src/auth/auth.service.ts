import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleStravaCallback(stravaData: any) {
    this.logger.log('🔧 handleStravaCallback() called');
    this.logger.debug(`📦 Received stravaData: ${JSON.stringify(stravaData, null, 2)}`);

    const { athlete, accessToken, refreshToken, expiresAt } = stravaData;

    this.logger.log(`🏃 Processing athlete: ${athlete?.firstname} ${athlete?.lastname} (ID: ${athlete?.id})`);

    // Check if user already exists
    this.logger.log(`🔍 Checking if user exists with Strava ID: ${athlete.id}`);
    let user = await this.usersService.findByStravaId(
      BigInt(athlete.id),
    );

    if (user) {
      this.logger.log(`✅ User found - Updating tokens for user ID: ${user.id}`);
      // Update existing user's tokens
      user = await this.usersService.update(user.id, {
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiresAt: new Date(expiresAt * 1000),
        name: `${athlete.firstname} ${athlete.lastname}`,
      });
      this.logger.log(`✅ User updated successfully`);
    } else {
      this.logger.log(`➕ User not found - Creating new user`);
      // Create new user
      user = await this.usersService.create({
        email: `${athlete.id}@strava.local`, // Strava doesn't provide email in OAuth
        name: `${athlete.firstname} ${athlete.lastname}`,
        stravaAthleteId: BigInt(athlete.id),
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiresAt: new Date(expiresAt * 1000),
      });
      this.logger.log(`✅ New user created with ID: ${user.id}`);
    }

    // Generate JWT token
    this.logger.log(`🔑 Generating JWT token for user ${user.id}`);
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    this.logger.log(`✅ JWT token generated: ${token.substring(0, 20)}...`);

    this.logger.log(`✅ handleStravaCallback() completed successfully`);
    return { token, user };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      const newPayload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: this.configService.get<number>('JWT_EXPIRES_IN') || 3600,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
