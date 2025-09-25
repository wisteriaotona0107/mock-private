import { z } from 'zod';

export const productFilterSchema = z.object({
  id: z.string().optional(),
  q: z.string().optional(),
  category: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;
