import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleStravaCallback(stravaData: any) {
    const { athlete, accessToken, refreshToken, expiresAt } = stravaData;

    // Check if user already exists
    let user = await this.usersService.findByStravaId(
      BigInt(athlete.id),
    );

    if (user) {
      // Update existing user's tokens
      user = await this.usersService.update(user.id, {
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiresAt: new Date(expiresAt * 1000),
        name: `${athlete.firstname} ${athlete.lastname}`,
      });
    } else {
      // Create new user
      user = await this.usersService.create({
        email: `${athlete.id}@strava.local`, // Strava doesn't provide email in OAuth
        name: `${athlete.firstname} ${athlete.lastname}`,
        stravaAthleteId: BigInt(athlete.id),
        stravaAccessToken: accessToken,
        stravaRefreshToken: refreshToken,
        stravaTokenExpiresAt: new Date(expiresAt * 1000),
      });
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

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
