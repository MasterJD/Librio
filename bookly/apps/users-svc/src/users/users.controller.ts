import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StructuredLogger } from '../logger/logger.service';

@Controller('users')
export class UsersController {
  private readonly logger = new StructuredLogger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Headers('x-correlation-id') correlationId?: string) {
    this.logger.log('Fetching user profile', correlationId, {
      payload: { message: 'Use GET /users/:id with your user ID' },
    });
    // JWT strategy will attach user to request
    // For now, return message - will be enhanced with request user
    return { message: 'Use GET /users/:id with your user ID' };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const user = await this.usersService.findOne(id);
    this.logger.log('Fetching user by id', correlationId, {
      payload: { userId: id, email: user?.email },
    });
    return user;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    this.logger.log('Updating user', correlationId, {
      payload: { userId: id, email: user?.email },
    });
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    await this.usersService.remove(id);
    this.logger.log('Removing user', correlationId, {
      payload: { userId: id, deleted: true },
    });
  }
}