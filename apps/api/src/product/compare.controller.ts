import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductService } from './product.service';

@Controller('compare-list')
@UseGuards(JwtAuthGuard)
export class CompareController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  get(@Req() req: any) {
    return this.productService.getCompareList(req.user.userId);
  }

  @Patch()
  update(@Req() req: any, @Body('productIds') productIds: string[]) {
    return this.productService.updateCompareList(req.user.userId, productIds ?? []);
  }
}
