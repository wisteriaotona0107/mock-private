import { z } from 'zod';

const questionMappingSchema = z.object({
  code: z.string(),
  axis: z.string(),
  scale: z.number().default(20),
  reverse: z.boolean().optional(),
});

export const axisSchema = z.object({
  key: z.string(),
  weight: z.number().min(0),
});

export const labelSchema = z.object({
  key: z.string(),
  thresholds: z.object({
    primary: z.number().min(0).max(100),
    secondary: z.number().min(0).max(100),
  }),
});

export const ruleSetConfigSchema = z.object({
  axes: z.array(axisSchema),
  questions: z.array(questionMappingSchema),
  labelMappings: z.array(labelSchema),
  seasonModifiers: z.record(z.number()),
  demographicModifiers: z.record(z.string(), z.record(z.number())),
  referralRules: z.array(
    z.object({
      questionCode: z.string(),
      triggerValue: z.union([z.string(), z.number()]),
    }),
  ),
  weights: z.object({
    fit: z.number(),
    ingredientSafety: z.number(),
    evidence: z.number(),
    review: z.number(),
    costPerformance: z.number(),
  }),
});

export type RuleSetConfig = z.infer<typeof ruleSetConfigSchema>;
