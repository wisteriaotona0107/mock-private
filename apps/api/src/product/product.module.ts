import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CompareController } from './compare.controller';

@Module({
  imports: [PrismaModule],
  providers: [ProductService],
  controllers: [ProductController, CompareController],
  exports: [ProductService],
})
export class ProductModule {}
