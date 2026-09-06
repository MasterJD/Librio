import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { BooksModule } from './books/books.module';
import { PrismaModule } from './database/prisma.module';
import { ConsulService } from './consul/consul.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

@Module({
  imports: [PrismaModule, BooksModule],
  controllers: [HealthController],
  providers: [ConsulService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
