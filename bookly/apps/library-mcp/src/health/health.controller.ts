import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getStatus() {
    return { status: 'ok', service: 'library-mcp' };
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
