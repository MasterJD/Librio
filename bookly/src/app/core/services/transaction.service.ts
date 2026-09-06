import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Rental {
  id: number;
  userId: number;
  bookId: number;
  startedAt: string;
  expiresAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: number;
  userId: number;
  bookId: number;
  price: string;
  status: string;
  createdAt: string;
}

export interface LibraryEntry {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  coverUrl: string | null;
  pdfUrl: string | null;
  price: string;
  availableCopies: number;
  totalCopies: number;
  createdAt: string;
  updatedAt: string;
  type: 'RENTED' | 'PURCHASED';
  expiresAt: string | null;
  rentalId: number | null;
  purchaseId: number | null;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API_URL = 'http://localhost:8003';

  constructor(private http: HttpClient) {}

  createRental(bookId: number, durationDays: number = 14) {
    return this.http.post<Rental>(`${this.API_URL}/rentals`, { bookId, durationDays });
  }

  getMyRentals() {
    return this.http.get<Rental[]>(`${this.API_URL}/rentals/me`);
  }

  returnBook(rentalId: number) {
    return this.http.post<Rental>(`${this.API_URL}/rentals/${rentalId}/return`, {});
  }

  purchaseBook(bookId: number) {
    return this.http.post<Purchase>(`${this.API_URL}/purchases`, { bookId });
  }

  getMyPurchases() {
    return this.http.get<Purchase[]>(`${this.API_URL}/purchases/me`);
  }

  getMyLibrary() {
    return this.http.get<LibraryEntry[]>(`${this.API_URL}/library`);
  }

  getBookAccess(bookId: number) {
    return this.http.get<{ bookId: number; accessType: string; downloadUrl: string; expiresAt: string | null }>(
      `${this.API_URL}/library/${bookId}/access`,
    );
  }
}
