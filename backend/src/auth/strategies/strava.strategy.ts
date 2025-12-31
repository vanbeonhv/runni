import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StravaStrategy extends PassportStrategy(Strategy, 'strava') {
  private readonly logger = new Logger(StravaStrategy.name);

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

    this.logger.log('🔧 StravaStrategy initialized');
    this.logger.log(`📍 Callback URL: ${configService.get<string>('STRAVA_CALLBACK_URL')}`);

    // CRITICAL: Override the internal OAuth2 getOAuthAccessToken to capture Strava's full response
    const self = this;
    const oauth2 = (this as any)._oauth2;
    const originalGetOAuthAccessToken = oauth2.getOAuthAccessToken.bind(oauth2);

    oauth2.getOAuthAccessToken = function (code: string, params: any, callback: any) {
      self.logger.log('🔄 Exchanging authorization code for access token');
      self.logger.debug(`📝 Code: ${code.substring(0, 10)}...`);

      originalGetOAuthAccessToken(code, params, function (err: any, accessToken: string, refreshToken: string, results: any) {
        if (err) {
          self.logger.error('❌ Token exchange failed', err);
          return callback(err);
        }

        self.logger.log('✅ Token exchange successful');
        self.logger.debug(`📦 Full token response: ${JSON.stringify(results, null, 2)}`);

        // Strava returns the athlete data in the token response
        // We need to make it available to the validate() method
        // Store it in the results object which gets passed as 'params' in older passport versions
        callback(null, accessToken, refreshToken, results);
      });
    };
  }

  // Override userProfile to use the athlete data from token response
  userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void {
    this.logger.log('📥 userProfile() called');

    // For Strava, we'll fetch the athlete profile directly
    // This will be called by passport-oauth2 after token exchange
    this.logger.log('🌐 Fetching athlete from Strava API');

    axios.get('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(response => {
      this.logger.log('✅ Successfully fetched athlete from API');
      this.logger.debug(`👤 Athlete: ${JSON.stringify(response.data, null, 2)}`);
      done(null, response.data);
    })
    .catch(error => {
      this.logger.error('❌ Failed to fetch athlete from API', error);
      done(error);
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    this.logger.log('🔍 validate() called - Processing OAuth callback');
    this.logger.debug(`🔑 Access Token: ${accessToken?.substring(0, 10)}...`);
    this.logger.debug(`🔄 Refresh Token: ${refreshToken?.substring(0, 10)}...`);
    this.logger.debug(`👤 Profile: ${JSON.stringify(profile, null, 2)}`);

    // Profile now contains the athlete data from the API
    const athleteData = profile;

    // Calculate expiry (Strava tokens expire in 6 hours)
    const expiresAt = Math.floor(Date.now() / 1000) + 21600;

    this.logger.log(`🏃 Athlete ID: ${athleteData?.id}`);
    this.logger.log(`👤 Athlete Name: ${athleteData?.firstname} ${athleteData?.lastname}`);
    this.logger.log(`⏰ Token expires at: ${new Date(expiresAt * 1000).toISOString()}`);

    const user = {
      accessToken,
      refreshToken,
      expiresAt,
      athlete: athleteData,
    };

    this.logger.log('✅ validate() completed successfully');
    this.logger.debug(`📤 Returning user: ${JSON.stringify(user, null, 2)}`);

    return user;
  }
}
