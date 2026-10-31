import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createPaymentSchema = z.object({
  invoiceId: z.string().trim().min(1, 'invoiceId is required'),
  method: z.nativeEnum(PaymentMethod),
  amount: z.coerce.number().positive('amount must be greater than 0'),
  paidOn: z.coerce.date().default(() => new Date()),
  note: z.string().trim().nullable().optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  invoiceId: z.string().trim().optional(),
});
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

