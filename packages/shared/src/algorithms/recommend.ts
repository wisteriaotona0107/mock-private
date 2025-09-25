import { RecommendationRequest } from '../schemas/recommendation';
import { RuleSetConfig } from '../schemas/rule-set';
import { EVIDENCE_LEVELS } from '../constants/evidence';
import { INGREDIENT_BLACKLIST, SENSITIVITY_FLAGS } from '../constants/blacklist';
import { bayesianAverage } from '../utils/bayes';
import { costPerformanceScore } from '../utils/price';

export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  volumeMl: number;
  ingredientSafety: number;
  ingredients: string[];
  tags: string[];
  evidenceKeys: string[];
  reviewScore: number;
  reviewCount: number;
  costPerformance?: number;
}

export interface RecommendationContext extends RecommendationRequest {
  ruleSetConfig: RuleSetConfig;
  products: RecommendationProduct[];
  limit?: number;
}

export interface RecommendationItem {
  productId: string;
  score: number;
  reason: string[];
}

function matchesFilters(product: RecommendationProduct, filters: RecommendationRequest['filters']): boolean {
  if (!filters) return true;
  if (filters.blacklist?.some((code) => INGREDIENT_BLACKLIST[code] && product.ingredients.includes(code))) {
    return false;
  }
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    if (product.price < min || product.price > max) {
      return false;
    }
  }
  if (filters.fragrance === 'avoid' && product.tags.includes('fragrance')) {
    return false;
  }
  if (filters.fragrance === 'prefer' && !product.tags.includes('fragrance')) {
    return false;
  }
  if (filters.menthol === 'avoid' && product.ingredients.some((i) => SENSITIVITY_FLAGS.includes(i))) {
    return false;
  }
  if (filters.menthol === 'prefer' && !product.ingredients.some((i) => ['menthol', 'peppermint'].includes(i))) {
    return false;
  }
  return true;
}

function fitScore(product: RecommendationProduct, scores: Record<string, number>, labels: string[]): number {
  if (labels.length === 0) return 50;
  const relevant = labels.map((label) => scores[label] ?? 50);
  return relevant.reduce((acc, cur) => acc + cur, 0) / relevant.length;
}

function evidenceScore(product: RecommendationProduct): number {
  const evidenceValues = product.evidenceKeys
    .map((key) => EVIDENCE_LEVELS[key] ?? 40)
    .sort((a, b) => b - a);
  if (evidenceValues.length === 0) return 40;
  return evidenceValues[0];
}

function reviewScore(product: RecommendationProduct): number {
  const bayes = bayesianAverage(product.reviewScore * product.reviewCount, product.reviewCount);
  return Math.min(100, Math.max(0, (bayes / 5) * 100));
}

function costScore(product: RecommendationProduct): number {
  return product.costPerformance ?? costPerformanceScore(product.price, product.volumeMl);
}

export function recommendProducts(context: RecommendationContext): RecommendationItem[] {
  const { products, scores, labels, filters, ruleSetConfig, limit = 6 } = context;
  const weight = ruleSetConfig.weights;
  const totalWeight =
    weight.fit + weight.ingredientSafety + weight.evidence + weight.review + weight.costPerformance;
  const validProducts = products.filter((product) => matchesFilters(product, filters));

  const items = validProducts.map<RecommendationItem>((product) => {
    const fit = fitScore(product, scores, labels);
    const safety = product.ingredientSafety;
    const evidence = evidenceScore(product);
    const review = reviewScore(product);
    const cost = costScore(product);
    const weightedSum =
      fit * weight.fit +
      safety * weight.ingredientSafety +
      evidence * weight.evidence +
      review * weight.review +
      cost * weight.costPerformance;
    const finalScore = totalWeight > 0 ? weightedSum / totalWeight : weightedSum;
    const reasons: string[] = [
      `頭皮状態との適合度 ${fit.toFixed(1)}%`,
      `安全性スコア ${safety.toFixed(1)}%`,
      `エビデンス指標 ${evidence.toFixed(1)}%`,
    ];
    if (review > 0) {
      reasons.push(`レビュー評価 ${review.toFixed(1)}%`);
    }
    reasons.push(`コスパ ${cost.toFixed(1)}%`);

    return {
      productId: product.id,
      score: Number(finalScore.toFixed(2)),
      reason: reasons.slice(0, 3),
    };
  });

  return items
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      reason: item.reason.slice(0, 3),
      score: Number(item.score.toFixed(2)),
    }));
}
