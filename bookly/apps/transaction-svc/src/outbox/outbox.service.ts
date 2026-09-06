import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: {
    userId: number;
    rentalId?: number;
    purchaseId?: number;
    eventType: string;
    payload: Record<string, any>;
  }) {
    return this.prisma.notificationOutbox.create({
      data: {
        userId: data.userId,
        rentalId: data.rentalId,
        purchaseId: data.purchaseId,
        eventType: data.eventType,
        payload: data.payload,
      },
    });
  }

  async getPendingEvents(limit = 10) {
    return this.prisma.notificationOutbox.findMany({
      where: { status: 'PENDING' },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  async markAsSent(id: number) {
    return this.prisma.notificationOutbox.update({
      where: { id },
      data: { status: 'SENT' },
    });
  }

  async markAsFailed(id: number) {
    return this.prisma.notificationOutbox.update({
      where: { id },
      data: {
        status: 'FAILED',
        attempts: { increment: 1 },
      },
    });
  }
}
