import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StructuredLogger } from '../logger/logger.service';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  private readonly logger = new StructuredLogger(LibraryController.name);

  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  async getLibrary(
    @Request() req: any,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const items = await this.libraryService.getLibrary(req.user.id);
    this.logger.log('Fetching user library', correlationId, {
      payload: {
        userId: req.user.id,
        count: items.length,
        rented: items.filter((i: any) => i.type === 'RENTED').length,
        owned: items.filter((i: any) => i.type === 'OWNED').length,
      },
    });
    return items;
  }

  @Get(':bookId/access')
  async getBookAccess(
    @Request() req: any,
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const result = await this.libraryService.getBookAccess(req.user.id, bookId);
    this.logger.log('Getting book access', correlationId, {
      payload: { ...result, userId: req.user.id, bookId },
    });
    return result;
  }
}