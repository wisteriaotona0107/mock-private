import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  recommendProducts,
  recommendationRequestSchema,
  RuleSetConfig,
  ruleSetConfigSchema,
} from '@scalp-care/shared';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async recommend(payload: unknown) {
    const request = recommendationRequestSchema.parse(payload);
    const ruleSet = await this.prisma.ruleSet.findFirst({ where: { active: true } });
    if (!ruleSet) {
      throw new NotFoundException('アクティブなルールセットが見つかりません');
    }
    const config = ruleSetConfigSchema.parse(ruleSet.config) as RuleSetConfig;
    const products = await this.prisma.product.findMany({
      take: 20,
      include: { tags: { include: { tag: true } } },
    });
    const items = recommendProducts({
      ruleSetConfig: config,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        volumeMl: (product.ingredients as any)?.volumeMl ?? 200,
        ingredientSafety: product.ingredientSafety,
        ingredients: Object.keys((product.ingredients as Record<string, unknown>) ?? {}),
        tags: product.tags.map((t) => t.tag.name),
        evidenceKeys: Object.keys((product.ingredients as Record<string, unknown>) ?? {}),
        reviewScore: product.reviewScore,
        reviewCount: product.reviewCount,
        costPerformance: product.costPerformance,
      })),
      scores: request.scores,
      labels: request.labels,
      filters: request.filters,
      limit: 6,
    });
    return { items };
  }
}
