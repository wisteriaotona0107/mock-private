import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { productFilterSchema } from '@scalp-care/shared';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: Record<string, unknown>) {
    const filters = productFilterSchema.parse(query);
    return this.prisma.product.findMany({
      where: {
        id: filters.id ?? undefined,
        name: filters.q ? { contains: filters.q, mode: 'insensitive' } : undefined,
        category: filters.category ?? undefined,
        tags: filters.tags
          ? {
              some: {
                tag: {
                  name: { in: filters.tags },
                },
              },
            }
          : undefined,
        price: {
          gte: filters.priceMin ?? undefined,
          lte: filters.priceMax ?? undefined,
        },
      },
      take: filters.limit,
      include: {
        tags: { include: { tag: true } },
      },
    });
  }

  async getCompareList(userId: string) {
    const list = await this.prisma.compareList.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    return list ?? { userId, items: [] };
  }

  async updateCompareList(userId: string, productIds: string[]) {
    const list = await this.prisma.compareList.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    await this.prisma.compareItem.deleteMany({ where: { compareListId: list.id } });
    await this.prisma.compareItem.createMany({
      data: productIds.slice(0, 4).map((productId, index) => ({
        compareListId: list.id,
        productId,
        order: index,
      })),
    });
    return this.getCompareList(userId);
  }
}
