import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StructuredLogger } from '../logger/logger.service';

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
  private readonly logger = new StructuredLogger(RentalsController.name);

  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createRentalDto: CreateRentalDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const rental = await this.rentalsService.create(req.user.id, createRentalDto);
    this.logger.log('Rental created', correlationId, {
      payload: {
        rentalId: rental?.id,
        userId: req.user.id,
        bookId: createRentalDto.bookId,
        expiresAt: rental?.expiresAt,
      },
    });
    return rental;
  }

  @Get('me')
  async findAllByUser(
    @Request() req: any,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const rentals = await this.rentalsService.findAllByUser(req.user.id);
    this.logger.log('Fetching user rentals', correlationId, {
      payload: { userId: req.user.id, count: rentals.length },
    });
    return rentals;
  }

  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const rental = await this.rentalsService.findOne(id, req.user.id);
    this.logger.log('Fetching rental', correlationId, {
      payload: { rentalId: id, status: rental?.status, bookId: rental?.bookId },
    });
    return rental;
  }

  @Post(':id/return')
  async returnBook(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const rental = await this.rentalsService.returnBook(id, req.user.id);
    this.logger.log('Book returned', correlationId, {
      payload: { rentalId: id, returned: true, status: rental?.status },
    });
    return rental;
  }
}