export interface Rental {
  id: number;
  userId: number;
  bookId: number;
  startedAt: Date;
  expiresAt: Date;
  status: RentalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type RentalStatus = 'ACTIVE' | 'EXPIRED' | 'RETURNED' | 'CANCELLED';

export interface CreateRentalDto {
  userId: number;
  bookId: number;
  durationDays: number;
}

export interface Purchase {
  id: number;
  userId: number;
  bookId: number;
  price: number;
  status: PurchaseStatus;
  createdAt: Date;
}

export type PurchaseStatus = 'COMPLETED' | 'REFUNDED';

export interface CreatePurchaseDto {
  userId: number;
  bookId: number;
}

export interface LibraryEntry {
  bookId: number;
  title: string;
  author: string;
  coverUrl?: string;
  accessType: 'PURCHASED' | 'RENTED';
  expiresAt?: Date;
  pdfUrl?: string;
}
