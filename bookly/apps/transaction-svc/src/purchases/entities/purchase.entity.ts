export interface PurchaseEntity {
  id: number;
  userId: number;
  bookId: number;
  price: number;
  status: string;
  createdAt: Date;
}
