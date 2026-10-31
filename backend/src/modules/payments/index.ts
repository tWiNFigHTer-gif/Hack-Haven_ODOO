import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createPaymentSchema, listPaymentsQuerySchema } from './schema';
import * as paymentsService from './service';

export const router = Router();

router.use(requireAuth, requireRole(Role.ADMIN, Role.STAFF));

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createPaymentSchema.parse(req.body);
      const recordedById = req.user!.id;
      const result = await paymentsService.recordPayment(input, recordedById);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listPaymentsQuerySchema.parse(req.query);
      const result = await paymentsService.listPayments(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

