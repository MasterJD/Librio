import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { AgentCardController } from './agent-card/agent-card.controller';
import { OrchestrateController } from './orchestrate/orchestrate.controller';
import { OrchestrateService } from './orchestrate/orchestrate.service';
import { AgentDiscoveryService } from './discovery/agent-discovery.service';
import { A2AClientService } from './a2a/a2a-client.service';
import { StructuredLogger } from './logger/logger.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

@Module({
  controllers: [HealthController, AgentCardController, OrchestrateController],
  providers: [OrchestrateService, AgentDiscoveryService, A2AClientService, StructuredLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}