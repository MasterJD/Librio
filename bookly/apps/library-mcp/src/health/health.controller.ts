import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'library-mcp' };
  }
}
