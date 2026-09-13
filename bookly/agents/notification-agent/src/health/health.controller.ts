import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getStatus() {
    return { status: 'ok', service: 'notification-agent' };
  }

  @Get('healthz')
  getHealth() {
    return { status: 'ok' };
  }

  @Get('readyz')
  getReady() {
    return { status: 'ok' };
  }
}
