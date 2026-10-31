import { Tax, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import { ListTaxesQuery, CreateTaxInput, UpdateTaxInput } from './schema';

const formatTax = (tax: Tax) => ({
  id: tax.id,
  name: tax.name,
  ratePercent: tax.ratePercent.toFixed(2),
  productType: tax.productType,
});

export const listTaxes = async (query: ListTaxesQuery) => {
  const where: Prisma.TaxWhereInput = {};
  if (query.q && query.q.trim() !== '') {
    where.name = { contains: query.q.trim(), mode: 'insensitive' };
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [taxes, total] = await Promise.all([
    prisma.tax.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.tax.count({ where }),
  ]);

  return {
    data: taxes.map(formatTax),
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getTaxById = async (id: string) => {
  const tax = await prisma.tax.findUnique({ where: { id } });
  if (!tax) {
    throw new AppError(404, 'NOT_FOUND', 'Tax not found');
  }
  return formatTax(tax);
};

export const createTax = async (input: CreateTaxInput) => {
  const tax = await prisma.tax.create({
    data: {
      name: input.name,
      ratePercent: new Prisma.Decimal(input.ratePercent),
      productType: input.productType,
    },
  });
  return formatTax(tax);
};

export const updateTax = async (id: string, input: UpdateTaxInput) => {
  const existing = await prisma.tax.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Tax not found');
  }

  const tax = await prisma.tax.update({
    where: { id },
    data: {
      name: input.name,
      ratePercent:
        input.ratePercent !== undefined
          ? new Prisma.Decimal(input.ratePercent)
          : undefined,
      productType: input.productType,
    },
  });

  return formatTax(tax);
};

export const deleteTax = async (id: string) => {
  const existing = await prisma.tax.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Tax not found');
  }

  const subscriptionLineCount = await prisma.subscriptionLine.count({
    where: { taxId: id },
  });

  if (subscriptionLineCount > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      'Cannot delete tax referenced by subscription lines'
    );
  }

  try {
    await prisma.tax.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Tax is referenced by other records');
    }
    throw error;
  }

  return { message: 'Tax deleted successfully' };
};

