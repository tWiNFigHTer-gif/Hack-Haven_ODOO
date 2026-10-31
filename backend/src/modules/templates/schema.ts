import { z } from 'zod';

export const listTemplatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;

export const templateLineInputSchema = z.object({
  productId: z.string().trim().min(1, 'productId is required'),
  variantId: z.string().trim().nullable().optional(),
  quantity: z.coerce.number().int().min(1, 'quantity must be >= 1'),
});
export type TemplateLineInput = z.infer<typeof templateLineInputSchema>;

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  validityDays: z.coerce.number().int().min(1, 'validityDays must be >= 1'),
  planId: z.string().trim().min(1, 'planId is required'),
  lines: z.array(templateLineInputSchema).default([]),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  validityDays: z.coerce.number().int().min(1).optional(),
  planId: z.string().trim().min(1).optional(),
  lines: z.array(templateLineInputSchema).optional(),
});
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

