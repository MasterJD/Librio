import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getStatus() {
    return { status: 'ok', service: 'notif-svc' };
  }

  @Get('healthz')
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('readyz')
  readinessCheck() {
    return { status: 'ok' };
  }
}
