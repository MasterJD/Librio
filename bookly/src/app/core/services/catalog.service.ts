import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Book {
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
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly API_URL = 'http://localhost:8001';

  constructor(private http: HttpClient) {}

  searchBooks(query?: string, genre?: string) {
    const params: any = {};
    if (query) params.title = query;
    if (query) params.query = query;
    if (genre) params.genre = genre;
    return this.http.get<Book[]>(`${this.API_URL}/books`, { params });
  }

  getBook(id: number) {
    return this.http.get<Book>(`${this.API_URL}/books/${id}`);
  }

  checkAvailability(id: number) {
    return this.http.get<{ bookId: number; available: boolean; availableCopies: number }>(
      `${this.API_URL}/books/${id}/availability`,
    );
  }
}
