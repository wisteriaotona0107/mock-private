import { z } from 'zod';

export const profileSchema = z.object({
  age: z.number().int().min(10).max(100),
  sex: z.enum(['male', 'female', 'other']),
  season: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
});

export const answerSchema = z.object({
  questionCode: z.string(),
  value: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]),
});

export const diagnosisRequestSchema = z.object({
  answers: z.array(answerSchema).min(8),
  profile: profileSchema,
  ruleSetId: z.string().uuid().optional(),
  filters: z
    .object({
      blacklist: z.array(z.string()).optional(),
      priceRange: z.tuple([z.number(), z.number()]).optional(),
      fragrance: z.enum(['prefer', 'avoid', 'neutral']).optional(),
      menthol: z.enum(['prefer', 'avoid', 'neutral']).optional(),
    })
    .optional(),
});

export const diagnosisResponseSchema = z.object({
  id: z.string().uuid(),
  scores: z.record(z.number()),
  labels: z.array(z.string()),
  recommendations: z.array(
    z.object({
      productId: z.string(),
      score: z.number(),
      reason: z.string(),
    }),
  ),
  medicalReferral: z.boolean(),
});

export type DiagnosisRequest = z.infer<typeof diagnosisRequestSchema>;
export type DiagnosisResponse = z.infer<typeof diagnosisResponseSchema>;
