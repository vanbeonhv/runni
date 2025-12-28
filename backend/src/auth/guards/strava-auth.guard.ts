import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class StravaAuthGuard extends AuthGuard('strava') {}
