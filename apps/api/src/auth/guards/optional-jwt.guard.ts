import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: unknown, user: any, info: any) {
    if (err || info) {
      return null;
    }
    return user ?? null;
  }
}
