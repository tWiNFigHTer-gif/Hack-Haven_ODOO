import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import {
  paginationQuerySchema,
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  createPlanSchema,
  updatePlanSchema,
} from './schema';
import * as catalogService from './service';

export const router = Router();

// ----------------------------------------------------
// Products
// ----------------------------------------------------
router.get(
  '/products',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await catalogService.listProducts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/products',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createProductSchema.parse(req.body);
      const result = await catalogService.createProduct(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/products/:id',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.getProductById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/products/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateProductSchema.parse(req.body);
      const result = await catalogService.updateProduct(req.params.id, input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/products/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.deleteProduct(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ----------------------------------------------------
// Product Variants
// ----------------------------------------------------
router.get(
  '/products/:id/variants',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.listVariantsByProduct(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/products/:id/variants',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createVariantSchema.parse(req.body);
      const result = await catalogService.createVariant(req.params.id, input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/variants/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateVariantSchema.parse(req.body);
      const result = await catalogService.updateVariant(req.params.id, input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/variants/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.deleteVariant(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ----------------------------------------------------
// Plans
// ----------------------------------------------------
router.get(
  '/plans',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const result = await catalogService.listPlans(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/plans',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createPlanSchema.parse(req.body);
      const result = await catalogService.createPlan(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/plans/:id',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.getPlanById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/plans/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updatePlanSchema.parse(req.body);
      const result = await catalogService.updatePlan(req.params.id, input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/plans/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogService.deletePlan(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

