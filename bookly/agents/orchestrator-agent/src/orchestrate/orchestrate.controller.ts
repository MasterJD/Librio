import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { OrchestrateService, OrchestrateRequest } from './orchestrate.service';
import { AgentDiscoveryService } from '../discovery/agent-discovery.service';
import { StructuredLogger } from '../logger/logger.service';

@Controller()
export class OrchestrateController {
  private readonly logger = new StructuredLogger('orchestrator-agent');

  constructor(
    private readonly orchestrateService: OrchestrateService,
    private readonly discovery: AgentDiscoveryService,
  ) {}

  @Post('orchestrate')
  @HttpCode(HttpStatus.OK)
  async orchestrate(
    @Body() body: OrchestrateRequest,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.orchestrateService.orchestrate(body, correlationId);
  }

  @Get('agents')
  async listAgents() {
    const cards = await this.discovery.discoverAll();
    return { agents: cards };
  }
}