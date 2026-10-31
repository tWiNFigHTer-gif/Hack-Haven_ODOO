import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { listUsersQuerySchema, createStaffSchema } from './schema';
import * as usersService from './service';

export const router = Router();

router.get(
  '/',
  requireAuth,
  requireRole(Role.ADMIN, Role.STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const result = await usersService.listUsers(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/staff',
  requireAuth,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createStaffSchema.parse(req.body);
      const result = await usersService.createStaff(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

