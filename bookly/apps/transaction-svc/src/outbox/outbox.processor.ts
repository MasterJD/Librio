import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';
import { ConsulService } from '../consul/consul.service';
import { CircuitBreaker } from '../resilience/circuit-breaker';
import { retryWithBackoff } from '../resilience/retry';
import axios from 'axios';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private readonly circuitBreaker = new CircuitBreaker(3, 30000);

  constructor(
    private readonly outboxService: OutboxService,
    private readonly consulService: ConsulService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPending() {
    const pending = await this.outboxService.getPendingEvents(10);

    for (const event of pending) {
      try {
        await this.circuitBreaker.execute(() => this.sendNotification(event));
        await this.outboxService.markAsSent(event.id);
        this.logger.log(`Notification sent: ${event.eventType}`, undefined, {
          eventId: event.id,
        });
      } catch (error) {
        await this.outboxService.markAsFailed(event.id);
        this.logger.error(
          `Failed to send notification: ${error.message}`,
          undefined,
          { eventId: event.id },
        );
      }
    }
  }

  private async sendNotification(event: any) {
    const notifUrl = await this.consulService.discover('notif-svc');
    const url = notifUrl || process.env.NOTIF_SVC_URL || 'http://localhost:8004';

    await retryWithBackoff(async () => {
      await axios.post(`${url}/notifications`, {
        userId: event.userId,
        type: event.eventType,
        subject: this.getSubject(event.eventType),
        message: this.getMessage(event.eventType, event.payload),
      });
    });
  }

  private getSubject(eventType: string): string {
    const subjects: Record<string, string> = {
      RENTAL_CREATED: 'Book Rental Confirmation',
      RENTAL_RETURNED: 'Book Return Confirmation',
      PURCHASE_COMPLETED: 'Purchase Confirmation',
    };
    return subjects[eventType] || 'Bookly Notification';
  }

  private getMessage(eventType: string, payload: any): string {
    const messages: Record<string, string> = {
      RENTAL_CREATED: `You have rented a book. It will expire on ${payload.expiresAt}.`,
      RENTAL_RETURNED: `You have returned the book successfully.`,
      PURCHASE_COMPLETED: `You have purchased a book for $${payload.price}.`,
    };
    return messages[eventType] || 'Notification from Bookly';
  }
}
