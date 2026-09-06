import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailService } from '../email/email.service';
import { StructuredLogger } from '../logger/logger.service';
import * as nodemailer from 'nodemailer';

const MOCK_EMAILS: Record<number, string> = {};

@Injectable()
export class NotificationsService {
  private readonly logger = new StructuredLogger(NotificationsService.name);
  private transporter: nodemailer.Transporter;
  private notificationIdCounter = 0;
  private notifications: Array<{
    id: number;
    userId: number;
    type: string;
    subject: string;
    message: string;
    sentAt: Date | null;
    createdAt: Date;
  }> = [];

  constructor(private readonly emailService: EmailService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
    });
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const { userId, type, subject, message } = createNotificationDto;

    this.notificationIdCounter++;
    const notification = {
      id: this.notificationIdCounter,
      userId,
      type,
      subject,
      message,
      sentAt: null,
      createdAt: new Date(),
    };

    this.notifications.push(notification);

    this.logger.log('Notification created', undefined, {
      notificationId: notification.id,
      userId,
      type,
    });

    try {
      const email = MOCK_EMAILS[userId] || `user${userId}@example.com`;
      const sent = await this.emailService.sendNotification(type, email, subject, {
        message,
        userName: `User ${userId}`,
      });

      if (sent) {
        notification.sentAt = new Date() as any;
        this.logger.log('Notification sent', undefined, {
          notificationId: notification.id,
          email,
        });
      }
    } catch (error) {
      this.logger.error('Failed to send notification', undefined, {
        notificationId: notification.id,
        error: error.message,
      });
    }

    return notification;
  }

  async findAllByUser(userId: number) {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async findAll() {
    return this.notifications;
  }

  async findOne(id: number) {
    return this.notifications.find((n) => n.id === id) || null;
  }
}
