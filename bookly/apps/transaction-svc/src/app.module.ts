import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { RentalsModule } from './rentals/rentals.module';
import { PurchasesModule } from './purchases/purchases.module';
import { LibraryModule } from './library/library.module';
import { OutboxModule } from './outbox/outbox.module';
import { PrismaModule } from './database/prisma.module';
import { ConsulModule } from './consul/consul.module';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    ConsulModule,
    AuthModule,
    RentalsModule,
    PurchasesModule,
    LibraryModule,
    OutboxModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
