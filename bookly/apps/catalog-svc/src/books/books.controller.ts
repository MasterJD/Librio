import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { StructuredLogger } from '../logger/logger.service';

@Controller('books')
export class BooksController {
  private readonly logger = new StructuredLogger(BooksController.name);

  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(
    @Query('genre') genre?: string,
    @Query('title') title?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const books = await this.booksService.findAll({ genre, title });
    this.logger.log('Listing books', correlationId, {
      payload: { count: books.length, genre: genre || null, title: title || null },
    });
    return books;
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const book = await this.booksService.findOne(id);
    this.logger.log('Fetching book by id', correlationId, {
      payload: { bookId: id, title: book?.title },
    });
    return book;
  }

  @Get(':id/availability')
  async checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const result = await this.booksService.checkAvailability(id);
    this.logger.log('Checking book availability', correlationId, {
      payload: { ...result, bookId: id },
    });
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBookDto: CreateBookDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const book = await this.booksService.create(createBookDto);
    this.logger.log('Creating new book', correlationId, {
      payload: { bookId: book?.id, title: book?.title, genre: book?.genre },
    });
    return book;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const book = await this.booksService.update(id, updateBookDto);
    this.logger.log('Updating book', correlationId, {
      payload: { bookId: id, title: book?.title },
    });
    return book;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    await this.booksService.remove(id);
    this.logger.log('Removing book', correlationId, {
      payload: { bookId: id, deleted: true },
    });
  }
}