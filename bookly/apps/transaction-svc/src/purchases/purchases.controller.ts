import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StructuredLogger } from '../logger/logger.service';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  private readonly logger = new StructuredLogger(PurchasesController.name);

  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const purchase = await this.purchasesService.create(req.user.id, createPurchaseDto);
    this.logger.log('Purchase created', correlationId, {
      payload: {
        purchaseId: purchase?.id,
        userId: req.user.id,
        bookId: createPurchaseDto.bookId,
        price: purchase?.price,
      },
    });
    return purchase;
  }

  @Get('me')
  async findAllByUser(
    @Request() req: any,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const purchases = await this.purchasesService.findAllByUser(req.user.id);
    this.logger.log('Fetching user purchases', correlationId, {
      payload: {
        userId: req.user.id,
        count: purchases.length,
        totalSpent: purchases.reduce(
          (sum: number, p: any) => sum + (p.price || 0),
          0,
        ),
      },
    });
    return purchases;
  }
}