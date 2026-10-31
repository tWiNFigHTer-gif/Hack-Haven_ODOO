import { z } from 'zod';
import { BillingPeriod } from '@prisma/client';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.string().trim().min(1, 'Type is required'),
  salesPrice: z.coerce.number().min(0, 'salesPrice must be >= 0'),
  costPrice: z.coerce.number().min(0, 'costPrice must be >= 0'),
  notes: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  salesPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  notes: z.string().nullable().optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createVariantSchema = z.object({
  attribute: z.string().trim().min(1, 'Attribute is required'),
  value: z.string().trim().min(1, 'Value is required'),
  extraPrice: z.coerce.number().min(0, 'extraPrice must be >= 0').default(0),
});
export type CreateVariantInput = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = z.object({
  attribute: z.string().trim().min(1).optional(),
  value: z.string().trim().min(1).optional(),
  extraPrice: z.coerce.number().min(0).optional(),
});
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export const createPlanSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    price: z.coerce.number().min(0, 'price must be >= 0'),
    billingPeriod: z.nativeEnum(BillingPeriod),
    minQuantity: z.coerce.number().int().min(1, 'minQuantity must be >= 1').default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    autoClose: z.boolean().default(false),
    allowEarlyClose: z.boolean().default(false),
    allowPause: z.boolean().default(false),
    allowRenew: z.boolean().default(false),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'endDate must be greater than or equal to startDate',
    path: ['endDate'],
  });
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    billingPeriod: z.nativeEnum(BillingPeriod).optional(),
    minQuantity: z.coerce.number().int().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
    autoClose: z.boolean().optional(),
    allowEarlyClose: z.boolean().optional(),
    allowPause: z.boolean().optional(),
    allowRenew: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'endDate must be greater than or equal to startDate',
      path: ['endDate'],
    }
  );
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

