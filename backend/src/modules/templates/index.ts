import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import {
  listTemplatesQuerySchema,
  createTemplateSchema,
  updateTemplateSchema,
} from './schema';
import * as templatesService from './service';

export const router = Router();

router.get(
  '/',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listTemplatesQuerySchema.parse(req.query);
      const result = await templatesService.listTemplates(query);
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
      const input = createTemplateSchema.parse(req.body);
      const result = await templatesService.createTemplate(input);
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
      const result = await templatesService.getTemplateById(req.params.id);
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
      const input = updateTemplateSchema.parse(req.body);
      const result = await templatesService.updateTemplate(req.params.id, input);
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
      const result = await templatesService.deleteTemplate(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

