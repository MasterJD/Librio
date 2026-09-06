import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import axios from 'axios';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async create(userId: number, createPurchaseDto: CreatePurchaseDto) {
    const catalogUrl = process.env.CATALOG_SVC_URL || 'http://localhost:8001';

    // Get book details from catalog-svc
    let bookPrice: number;
    try {
      const response = await axios.get(
        `${catalogUrl}/books/${createPurchaseDto.bookId}`,
      );
      bookPrice = parseFloat(response.data.price);
    } catch (error) {
      throw new BadRequestException('Failed to get book details');
    }

    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        bookId: createPurchaseDto.bookId,
        price: bookPrice,
      },
    });

    // Create outbox event
    await this.outboxService.createEvent({
      userId,
      purchaseId: purchase.id,
      eventType: 'PURCHASE_COMPLETED',
      payload: {
        bookId: createPurchaseDto.bookId,
        price: bookPrice,
      },
    });

    return purchase;
  }

  async findAllByUser(userId: number) {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
