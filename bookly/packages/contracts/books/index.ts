export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  price: number;
  availableCopies: number;
  totalCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  price: number;
  totalCopies: number;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  price?: number;
  totalCopies?: number;
}

export interface BookAvailabilityResponse {
  bookId: number;
  available: boolean;
  availableCopies: number;
}

export interface SearchBooksQuery {
  genre?: string;
  title?: string;
}
