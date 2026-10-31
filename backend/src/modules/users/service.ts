import { Role, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import { validatePassword, hash } from '../../utils/password';
import { ListUsersQuery, CreateStaffInput } from './schema';

export const listUsers = async (query: ListUsersQuery) => {
  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.search && query.search.trim() !== '') {
    const search = query.search.trim();
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const createStaff = async (input: CreateStaffInput) => {
  const passwordErrors = validatePassword(input.password);
  if (passwordErrors.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Password does not meet requirements', passwordErrors);
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email already in use');
  }

  const passwordHash = await hash(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.STAFF,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { user };
};

