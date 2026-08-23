export interface CreateRentalRequest {
  userId: number;
  bookId: number;
  durationDays: number;
}

export interface RentalResponse {
  id: number;
  userId: number;
  bookId: number;
  startedAt: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

export interface CreatePurchaseRequest {
  userId: number;
  bookId: number;
}

export interface PurchaseResponse {
  id: number;
  userId: number;
  bookId: number;
  price: number;
  status: string;
  createdAt: string;
}

export interface LibraryEntry {
  bookId: number;
  title: string;
  author: string;
  coverUrl?: string;
  accessType: 'PURCHASED' | 'RENTED';
  expiresAt?: string;
  pdfUrl?: string;
}

export interface BookAccessResponse {
  url: string;
  expiresIn: number;
}
