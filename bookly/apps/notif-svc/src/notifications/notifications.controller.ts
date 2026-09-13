import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { StructuredLogger } from '../logger/logger.service';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new StructuredLogger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const notification = await this.notificationsService.create(createNotificationDto);
    this.logger.log('Notification created', correlationId, {
      payload: {
        notificationId: notification?.id,
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        sentAt: notification?.sentAt,
      },
    });
    return notification;
  }

  @Get()
  async findAll(@Headers('x-correlation-id') correlationId?: string) {
    const notifications = await this.notificationsService.findAll();
    this.logger.log('Fetching all notifications', correlationId, {
      payload: { count: notifications.length },
    });
    return notifications;
  }

  @Get('users/:userId')
  async findAllByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const notifications = await this.notificationsService.findAllByUser(userId);
    this.logger.log('Fetching user notifications', correlationId, {
      payload: { userId, count: notifications.length },
    });
    return notifications;
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const notification = await this.notificationsService.findOne(id);
    this.logger.log('Fetching notification', correlationId, {
      payload: { notificationId: id, type: notification?.type, userId: notification?.userId },
    });
    return notification;
  }
}