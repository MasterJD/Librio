export interface BookEntity {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description: string;
  coverUrl: string | null;
  pdfUrl: string | null;
  price: number;
  availableCopies: number;
  totalCopies: number;
  createdAt: Date;
  updatedAt: Date;
}
