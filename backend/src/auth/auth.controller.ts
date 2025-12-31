import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { StravaAuthGuard } from './guards/strava-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('strava/login')
  @UseGuards(StravaAuthGuard)
  async stravaLogin() {
    // This route initiates the Strava OAuth flow
    this.logger.log('🚀 GET /auth/strava/login - Initiating Strava OAuth flow');
  }

  @Public()
  @Get('strava/callback')
  @UseGuards(StravaAuthGuard)
  async stravaCallback(@Req() req: Request, @Res() res: Response) {
    this.logger.log('🔙 GET /auth/strava/callback - Handling OAuth callback');
    this.logger.debug(`📦 req.user: ${JSON.stringify(req.user, null, 2)}`);

    const { token, user } = await this.authService.handleStravaCallback(
      req.user,
    );

    this.logger.log(`✅ OAuth callback handled successfully`);
    this.logger.log(`👤 User ID: ${user.id}`);
    this.logger.log(`🔑 JWT Token: ${token.substring(0, 20)}...`);

    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;

    this.logger.log(`🔀 Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.validateUser(user.userId);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}
