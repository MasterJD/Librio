import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  RENTAL_CREATED = 'RENTAL_CREATED',
  RENTAL_RETURNED = 'RENTAL_RETURNED',
  RENTAL_EXPIRING = 'RENTAL_EXPIRING',
  PURCHASE_CONFIRMATION = 'PURCHASE_CONFIRMATION',
  WELCOME = 'WELCOME',
}

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsNumber()
  rentalId?: number;

  @IsOptional()
  @IsNumber()
  purchaseId?: number;
}
