export type NotificationType =
  | 'RENTAL_CREATED'
  | 'PURCHASE_CONFIRMATION'
  | 'RENTAL_EXPIRING'
  | 'RENTAL_RETURNED';

export interface CreateNotificationRequest {
  userId: number;
  type: NotificationType;
  subject: string;
  message: string;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  type: string;
  subject: string;
  message: string;
  sentAt?: string;
  createdAt: string;
}
