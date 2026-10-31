import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, InvoiceStatus } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as meService from './service';

export const router = Router();

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const invoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

router.use(requireAuth, requireRole(Role.CUSTOMER));

router.get(
  '/subscriptions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const customerId = req.user!.id;
      const result = await meService.getMySubscriptions(customerId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/invoices',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = invoicesQuerySchema.parse(req.query);
      const customerId = req.user!.id;
      const result = await meService.getMyInvoices(customerId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/invoices/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user!.id;
      const result = await meService.getMyInvoiceById(customerId, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

