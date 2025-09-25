import { z } from 'zod';

export const recommendationRequestSchema = z.object({
  labels: z.array(z.string()).min(1),
  scores: z.record(z.number()),
  filters: z
    .object({
      blacklist: z.array(z.string()).optional(),
      priceRange: z.tuple([z.number(), z.number()]).optional(),
      fragrance: z.enum(['prefer', 'avoid', 'neutral']).optional(),
      menthol: z.enum(['prefer', 'avoid', 'neutral']).optional(),
    })
    .optional(),
});

export const recommendationResponseSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      score: z.number(),
      reason: z.array(z.string()),
    }),
  ),
});

export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;
