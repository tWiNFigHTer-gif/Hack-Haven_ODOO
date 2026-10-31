import { z } from 'zod';
import { DiscountType, DiscountScope } from '@prisma/client';

export const listDiscountsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});
export type ListDiscountsQuery = z.infer<typeof listDiscountsQuerySchema>;

export const createDiscountSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    type: z.nativeEnum(DiscountType),
    value: z.coerce.number(),
    minPurchase: z.coerce.number().min(0, 'minPurchase must be >= 0').nullable().optional(),
    minQuantity: z.coerce.number().int().min(1, 'minQuantity must be >= 1').nullable().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    usageLimit: z.coerce.number().int().min(1, 'usageLimit must be >= 1').nullable().optional(),
    usedCount: z.unknown().optional(), // ignored if sent
    appliesTo: z.nativeEnum(DiscountScope),
    productId: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be greater than or equal to startDate',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.type === DiscountType.PERCENT) {
        return data.value >= 1 && data.value <= 100;
      }
      return data.value > 0;
    },
    {
      message: 'For PERCENT type, value must be 1-100; for FIXED type, value must be > 0',
      path: ['value'],
    }
  )
  .refine(
    (data) => {
      if (data.appliesTo === DiscountScope.PRODUCT) {
        return !!data.productId && data.productId.trim() !== '';
      }
      return !data.productId;
    },
    {
      message: 'appliesTo PRODUCT requires productId; appliesTo SUBSCRIPTION forbids productId',
      path: ['productId'],
    }
  );
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;

export const updateDiscountSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    type: z.nativeEnum(DiscountType).optional(),
    value: z.coerce.number().optional(),
    minPurchase: z.coerce.number().min(0).nullable().optional(),
    minQuantity: z.coerce.number().int().min(1).nullable().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    usageLimit: z.coerce.number().int().min(1).nullable().optional(),
    usedCount: z.unknown().optional(), // ignored if sent
    appliesTo: z.nativeEnum(DiscountScope).optional(),
    productId: z.string().trim().nullable().optional(),
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
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

