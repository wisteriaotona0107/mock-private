import { BadRequestException, Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { registerSchema, loginSchema } from '@scalp-care/shared';
import { ZodError } from 'zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    try {
      const data = registerSchema.parse(body);
      return await this.authService.register(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({ message: '入力値が正しくありません', details: error.issues });
      }
      throw error;
    }
  }

  @Post('login')
  async login(@Body() body: unknown) {
    try {
      const data = loginSchema.parse(body);
      return await this.authService.login(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({ message: '入力値が正しくありません', details: error.issues });
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return { id: req.user.userId, email: req.user.email, role: req.user.role };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Req() req: any) {
    return this.authService.deleteAccount(req.user.userId);
  }
}
