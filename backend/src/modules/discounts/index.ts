import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import {
  listDiscountsQuerySchema,
  createDiscountSchema,
  updateDiscountSchema,
} from './schema';
import * as discountsService from './service';

export const router = Router();

router.get(
  '/',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listDiscountsQuerySchema.parse(req.query);
      const result = await discountsService.listDiscounts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createDiscountSchema.parse(req.body);
      const result = await discountsService.createDiscount(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await discountsService.getDiscountById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateDiscountSchema.parse(req.body);
      const result = await discountsService.updateDiscount(req.params.id, input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await discountsService.deleteDiscount(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

