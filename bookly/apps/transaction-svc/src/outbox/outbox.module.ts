import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { PrismaModule } from '../database/prisma.module';
import { ConsulModule } from '../consul/consul.module';

@Module({
  imports: [PrismaModule, ConsulModule],
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
