export interface RentalEntity {
  id: number;
  userId: number;
  bookId: number;
  startedAt: Date;
  expiresAt: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
