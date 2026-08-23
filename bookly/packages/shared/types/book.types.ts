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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookDto {
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

export interface UpdateBookDto {
  title?: string;
  author?: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  price?: number;
  totalCopies?: number;
}

export interface BookAvailability {
  bookId: number;
  available: boolean;
  availableCopies: number;
}
