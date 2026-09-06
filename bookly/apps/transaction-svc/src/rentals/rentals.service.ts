import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import axios from 'axios';

@Injectable()
export class RentalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(userId: number, createRentalDto: CreateRentalDto) {
    const catalogUrl = process.env.CATALOG_SVC_URL || 'http://localhost:8001';

    // Check book availability via catalog-svc
    try {
      const response = await axios.get(
        `${catalogUrl}/books/${createRentalDto.bookId}/availability`,
      );
      if (!response.data.available) {
        throw new BadRequestException('Book is not available');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to verify book availability');
    }

    // Check user's active rentals (max 5)
    const activeRentals = await this.prisma.rental.count({
      where: { userId, status: 'ACTIVE' },
    });
    if (activeRentals >= 5) {
      throw new BadRequestException('Maximum 5 active rentals allowed');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + createRentalDto.durationDays);

    const rental = await this.prisma.rental.create({
      data: {
        userId,
        bookId: createRentalDto.bookId,
        expiresAt,
      },
    });

    // Decrement book availability
    try {
      await axios.put(`${catalogUrl}/books/${createRentalDto.bookId}`, {
        availableCopies: { decrement: 1 },
      });
    } catch (error) {
      // Log but don't fail - catalog service might handle this differently
    }

    // Create outbox event
    await this.outboxService.createEvent({
      userId,
      rentalId: rental.id,
      eventType: 'RENTAL_CREATED',
      payload: {
        bookId: createRentalDto.bookId,
        expiresAt: expiresAt.toISOString(),
        durationDays: createRentalDto.durationDays,
      },
    });

    return rental;
  }

  async findOne(id: number, userId: number) {
    const rental = await this.prisma.rental.findFirst({
      where: { id, userId },
    });
    if (!rental) {
      throw new NotFoundException(`Rental with ID ${id} not found`);
    }
    return rental;
  }

  async findAllByUser(userId: number) {
    return this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async returnBook(id: number, userId: number) {
    const rental = await this.findOne(id, userId);

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestException('Rental is not active');
    }

    const updatedRental = await this.prisma.rental.update({
      where: { id },
      data: { status: 'RETURNED' },
    });

    // Increment book availability
    const catalogUrl = process.env.CATALOG_SVC_URL || 'http://localhost:8001';
    try {
      await axios.put(`${catalogUrl}/books/${rental.bookId}`, {
        availableCopies: { increment: 1 },
      });
    } catch (error) {
      // Log but don't fail
    }

    // Create outbox event
    await this.outboxService.createEvent({
      userId,
      rentalId: rental.id,
      eventType: 'RENTAL_RETURNED',
      payload: { bookId: rental.bookId },
    });

    return updatedRental;
  }
}
