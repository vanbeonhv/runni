import { Controller, Get, Post, Body, Query, HttpCode } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Get('strava')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    // Strava sends a GET request to verify the webhook subscription
    if (mode === 'subscribe') {
      return { 'hub.challenge': challenge };
    }
  }

  @Public()
  @Post('strava')
  @HttpCode(200)
  async receiveWebhook(@Body() payload: any) {
    return this.webhooksService.handleWebhookEvent(payload);
  }
}
