import { z } from 'zod';

export const listTaxesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type ListTaxesQuery = z.infer<typeof listTaxesQuerySchema>;

export const createTaxSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  ratePercent: z.coerce
    .number()
    .min(0, 'ratePercent must be >= 0')
    .max(100, 'ratePercent must be <= 100'),
  productType: z.string().trim().nullable().optional(),
});
export type CreateTaxInput = z.infer<typeof createTaxSchema>;

export const updateTaxSchema = z.object({
  name: z.string().trim().min(1).optional(),
  ratePercent: z.coerce
    .number()
    .min(0, 'ratePercent must be >= 0')
    .max(100, 'ratePercent must be <= 100')
    .optional(),
  productType: z.string().trim().nullable().optional(),
});
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;

