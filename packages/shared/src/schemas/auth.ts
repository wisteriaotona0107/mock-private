import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional(),
  ageRange: z.enum(['teens', 'twenties', 'thirties', 'forties', 'fifties_plus']).optional(),
  scalpType: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
