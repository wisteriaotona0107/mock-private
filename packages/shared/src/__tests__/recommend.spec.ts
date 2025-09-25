import { recommendProducts, RecommendationProduct } from '../algorithms/recommend';
import { RecommendationRequest } from '../schemas/recommendation';
import { RuleSetConfig } from '../schemas/rule-set';

describe('recommendProducts', () => {
  const config: RuleSetConfig = {
    axes: [],
    questions: [],
    labelMappings: [],
    seasonModifiers: {},
    demographicModifiers: {},
    referralRules: [],
    weights: { fit: 0.4, ingredientSafety: 0.25, evidence: 0.15, review: 0.1, costPerformance: 0.1 },
  };

  const products: RecommendationProduct[] = [
    {
      id: '1',
      name: 'A',
      price: 3000,
      volumeMl: 200,
      ingredientSafety: 90,
      ingredients: ['minoxidil'],
      tags: ['fragrance'],
      evidenceKeys: ['minoxidil'],
      reviewScore: 4.5,
      reviewCount: 100,
      costPerformance: 70,
    },
    {
      id: '2',
      name: 'B',
      price: 2000,
      volumeMl: 150,
      ingredientSafety: 60,
      ingredients: ['parabens'],
      tags: [],
      evidenceKeys: ['caffeine'],
      reviewScore: 4,
      reviewCount: 10,
      costPerformance: 80,
    },
  ];

  it('filters products by blacklist and sorts by score', () => {
    const request: RecommendationRequest = {
      labels: ['Sebum'],
      scores: { Sebum: 70 },
      filters: { blacklist: ['parabens'] },
    };
    const items = recommendProducts({
      ruleSetConfig: config,
      products,
      labels: request.labels,
      scores: request.scores,
      filters: request.filters,
      limit: 5,
    });
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('1');
  });
});
