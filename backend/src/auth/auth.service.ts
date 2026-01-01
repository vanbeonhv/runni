import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { StravaService } from '../strava/strava.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private stravaService: StravaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleStravaCallback(stravaData: any) {
    this.logger.log('🔧 handleStravaCallback() called');
    this.logger.debug(`📦 Received stravaData: ${JSON.stringify(stravaData, null, 2)}`);

    const { athlete, accessToken, refreshToken, expiresAt } = stravaData;

    this.logger.log(`🏃 Processing athlete: ${athlete?.firstname} ${athlete?.lastname} (ID: ${athlete?.id})`);

    // Extract avatar URL from Strava athlete data (prefer profile_medium for better performance)
    const avatarUrl = athlete?.profile_medium || athlete?.profile || null;

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
        avatarUrl: avatarUrl,
      });
      this.logger.log(`✅ User updated successfully`);
    } else {
      this.logger.log(`➕ User not found - Creating new user`);
      // Create new user
      user = await this.usersService.create({
        email: `${athlete.id}@strava.local`, // Strava doesn't provide email in OAuth
        name: `${athlete.firstname} ${athlete.lastname}`,
        avatarUrl: avatarUrl,
        stravaAthleteId: BigInt(athlete.id),
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiresAt: new Date(expiresAt * 1000),
      });
      this.logger.log(`✅ New user created with ID: ${user.id}`);

      // Trigger initial activity sync (fire-and-forget, non-blocking)
      const newUserId = user.id;
      this.logger.log(`🔄 Initiating initial activity sync for new user ${newUserId}`);
      this.stravaService.syncInitialActivities(newUserId)
        .then(result => {
          this.logger.log(
            `✅ Initial sync completed: ${result.activitiesNew} new, ` +
            `${result.activitiesUpdated} updated`
          );
        })
        .catch(error => {
          this.logger.error(
            `❌ Initial activity sync failed for user ${newUserId}`,
            error.stack
          );
          // Error logged but doesn't block login flow
        });
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

  /**
   * Parse JWT expiration string (e.g., '90d', '30d', '1h') to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Default to 90 days if format is invalid
      return 90 * 24 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 90 * 24 * 60 * 60; // Default to 90 days
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      const newPayload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(newPayload);

      // Parse expiresIn from config (e.g., '90d' -> 90 days in seconds)
      const expiresInConfig = this.configService.get<string>('JWT_EXPIRES_IN') || '90d';
      const expiresInSeconds = this.parseExpiresIn(expiresInConfig);

      return {
        accessToken,
        expiresIn: expiresInSeconds,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
