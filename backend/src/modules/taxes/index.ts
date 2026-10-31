import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { listTaxesQuerySchema, createTaxSchema, updateTaxSchema } from './schema';
import * as taxesService from './service';

export const router = Router();

router.get(
  '/',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listTaxesQuerySchema.parse(req.query);
      const result = await taxesService.listTaxes(query);
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
      const input = createTaxSchema.parse(req.body);
      const result = await taxesService.createTax(input);
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
      const result = await taxesService.getTaxById(req.params.id);
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
      const input = updateTaxSchema.parse(req.body);
      const result = await taxesService.updateTax(req.params.id, input);
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
      const result = await taxesService.deleteTax(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

