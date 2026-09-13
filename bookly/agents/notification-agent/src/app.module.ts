import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { AgentCardController } from './agent-card/agent-card.controller';
import { A2AController } from './a2a/a2a.controller';
import { A2AService } from './a2a/a2a.service';
import { LibraryClientService } from './library/library-client.service';
import { StructuredLogger } from './logger/logger.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

@Module({
  controllers: [HealthController, AgentCardController, A2AController],
  providers: [A2AService, LibraryClientService, StructuredLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}