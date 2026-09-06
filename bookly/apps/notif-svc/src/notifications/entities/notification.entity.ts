export interface Notification {
  id: number;
  userId: number;
  type: string;
  subject: string;
  message: string;
  sentAt: Date | null;
  createdAt: Date;
}
