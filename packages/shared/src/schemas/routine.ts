import { z } from 'zod';

export const routineItemSchema = z.object({
  name: z.string(),
  schedule: z.string(),
});

export const routineCreateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  items: z.array(routineItemSchema).min(1),
});

export const routineCheckinSchema = z.object({
  date: z.string(),
  completed: z.boolean().default(true),
});

export type RoutineCreateInput = z.infer<typeof routineCreateSchema>;
