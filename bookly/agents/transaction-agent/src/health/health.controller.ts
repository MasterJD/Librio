import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getStatus() {
    return { status: 'ok', service: 'transaction-agent' };
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
