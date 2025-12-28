import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StravaStrategy extends PassportStrategy(Strategy, 'strava') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://www.strava.com/oauth/authorize',
      tokenURL: 'https://www.strava.com/oauth/token',
      clientID: configService.get<string>('STRAVA_CLIENT_ID') || '',
      clientSecret: configService.get<string>('STRAVA_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('STRAVA_CALLBACK_URL') || 'http://localhost:3000/auth/strava/callback',
      scope: 'activity:read_all,activity:write',
      scopeSeparator: ',',
    });
  }

  async validate(accessToken: string, refreshToken: string, params: any) {
    // Strava returns athlete data in the token response params
    return {
      accessToken,
      refreshToken,
      expiresAt: params.expires_at,
      athlete: params.athlete,
    };
  }
}
