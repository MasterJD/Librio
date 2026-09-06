import { Controller, Post, Body, Headers, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StructuredLogger } from '../logger/logger.service';

@Controller()
export class AuthController {
  private readonly logger = new StructuredLogger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const result = await this.authService.register(registerDto);
    this.logger.log('User registered', correlationId, {
      payload: { userId: result?.user?.id, email: result?.user?.email },
    });
    return result;
  }

  @Post('auth/login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const result = await this.authService.login(loginDto);
    this.logger.log('User logged in', correlationId, {
      payload: { userId: result?.user?.id, email: result?.user?.email },
    });
    return result;
  }

  @Get('auth/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    this.logger.log('Profile requested', undefined, {
      payload: { userId: req.user?.id, email: req.user?.email },
    });
    return req.user;
  }
}