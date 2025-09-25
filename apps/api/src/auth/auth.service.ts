import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { registerSchema, loginSchema, RegisterInput } from '@scalp-care/shared';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(payload: RegisterInput) {
    const data = registerSchema.parse(payload);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('既に登録済みのメールアドレスです');
    }
    const passwordHash = await argon2.hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        gender: data.gender,
        ageRange: data.ageRange,
        scalpType: data.scalpType,
      },
    });
    return this.signToken(user.id, user.email, user.role);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('認証に失敗しました');
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('認証に失敗しました');
    }
    return user;
  }

  async login(payload: { email: string; password: string }) {
    const data = loginSchema.parse(payload);
    const user = await this.validateUser(data.email, data.password);
    return this.signToken(user.id, user.email, user.role);
  }

  private async signToken(userId: string, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email, role });
    return { accessToken };
  }

  async deleteAccount(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({ where: { userId } });
      await tx.review.deleteMany({ where: { userId } });
      await tx.compareList.deleteMany({ where: { userId } });
      await tx.routine.deleteMany({ where: { userId } });
      await tx.diagnosis.updateMany({ where: { userId }, data: { userId: null } });
      await tx.user.delete({ where: { id: userId } });
    });
    return { status: 'deleted' };
  }
}
