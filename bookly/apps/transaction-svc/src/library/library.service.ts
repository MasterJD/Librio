import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibrary(userId: number) {
    const rentals = await this.prisma.rental.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const purchases = await this.prisma.purchase.findMany({
      where: { userId },
    });

    const bookIds = [
      ...new Set([
        ...rentals.map((r) => r.bookId),
        ...purchases.map((p) => p.bookId),
      ]),
    ];

    // Get book details from catalog-svc
    const catalogUrl = process.env.CATALOG_SVC_URL || 'http://localhost:8001';
    const books = [];

    for (const bookId of bookIds) {
      try {
        const response = await fetch(`${catalogUrl}/books/${bookId}`);
        if (response.ok) {
          const book = await response.json();
          const rental = rentals.find((r) => r.bookId === bookId);
          const purchase = purchases.find((p) => p.bookId === bookId);

          books.push({
            ...book,
            type: purchase ? 'PURCHASED' : 'RENTED',
            expiresAt: rental?.expiresAt || null,
            rentalId: rental?.id || null,
            purchaseId: purchase?.id || null,
          });
        }
      } catch (error) {
        // Skip books that can't be fetched
      }
    }

    return books;
  }

  async getBookAccess(userId: number, bookId: number) {
    // Check if user owns the book (purchased or active rental)
    const rental = await this.prisma.rental.findFirst({
      where: {
        userId,
        bookId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
    });

    const purchase = await this.prisma.purchase.findFirst({
      where: { userId, bookId },
    });

    if (!rental && !purchase) {
      throw new NotFoundException('You do not have access to this book');
    }

    // Fetch book details from catalog-svc to get the PDF URL
    const catalogUrl = process.env.CATALOG_SVC_URL || 'http://localhost:8001';
    let pdfUrl: string | null = null;
    try {
      const response = await fetch(`${catalogUrl}/books/${bookId}`);
      if (response.ok) {
        const book = await response.json();
        pdfUrl = book.pdfUrl || null;
      }
    } catch (error) {
      // Book details unavailable - pdfUrl stays null
    }

    // Fallback: dummy PDF so the demo always has a readable file
    if (!pdfUrl) {
      pdfUrl = 'https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf';
    }

    // Generate temporary signed URL (placeholder - in real app would use S3 signed URLs)
    const expiresInSeconds = rental ? Math.floor((rental.expiresAt.getTime() - Date.now()) / 1000) : 3600;

    return {
      bookId,
      accessType: purchase ? 'PURCHASED' : 'RENTED',
      pdfUrl,
      downloadUrl: `/api/books/${bookId}/download?token=placeholder&expires=${Date.now() + expiresInSeconds * 1000}`,
      expiresAt: rental?.expiresAt || null,
    };
  }
}
