import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { genre?: string; title?: string }): Promise<Book[]> {
    const where: any = {};

    if (query?.genre) {
      where.genre = query.genre;
    }

    if (query?.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }

    return this.prisma.book.findMany({ where });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.prisma.book.findUnique({ where: { isbn } });
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const existingBook = await this.findByIsbn(createBookDto.isbn);
    if (existingBook) {
      throw new ConflictException(`Book with ISBN ${createBookDto.isbn} already exists`);
    }

    return this.prisma.book.create({
      data: {
        ...createBookDto,
        availableCopies: createBookDto.totalCopies,
      },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async remove(id: number): Promise<Book> {
    await this.findOne(id);

    return this.prisma.book.delete({ where: { id } });
  }

  async checkAvailability(id: number): Promise<{ bookId: number; available: boolean; availableCopies: number }> {
    const book = await this.findOne(id);
    return {
      bookId: book.id,
      available: book.availableCopies > 0,
      availableCopies: book.availableCopies,
    };
  }

  async decrementAvailability(id: number): Promise<Book> {
    const book = await this.findOne(id);
    if (book.availableCopies <= 0) {
      throw new ConflictException(`Book with ID ${id} is not available`);
    }

    return this.prisma.book.update({
      where: { id },
      data: { availableCopies: { decrement: 1 } },
    });
  }

  async incrementAvailability(id: number): Promise<Book> {
    const book = await this.findOne(id);
    if (book.availableCopies >= book.totalCopies) {
      throw new ConflictException(`Book with ID ${id} already has all copies available`);
    }

    return this.prisma.book.update({
      where: { id },
      data: { availableCopies: { increment: 1 } },
    });
  }
}
