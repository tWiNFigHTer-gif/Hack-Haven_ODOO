import { Discount, DiscountType, DiscountScope, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import {
  ListDiscountsQuery,
  CreateDiscountInput,
  UpdateDiscountInput,
} from './schema';

const formatDiscount = (d: Discount) => ({
  id: d.id,
  name: d.name,
  type: d.type,
  value: d.value.toFixed(2),
  minPurchase: d.minPurchase ? d.minPurchase.toFixed(2) : null,
  minQuantity: d.minQuantity,
  startDate: d.startDate.toISOString(),
  endDate: d.endDate.toISOString(),
  usageLimit: d.usageLimit,
  usedCount: d.usedCount,
  appliesTo: d.appliesTo,
  productId: d.productId,
});

export const listDiscounts = async (query: ListDiscountsQuery) => {
  const where: Prisma.DiscountWhereInput = {};
  if (query.q && query.q.trim() !== '') {
    where.name = { contains: query.q.trim(), mode: 'insensitive' };
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.discount.count({ where }),
  ]);

  return {
    data: discounts.map(formatDiscount),
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getDiscountById = async (id: string) => {
  const discount = await prisma.discount.findUnique({ where: { id } });
  if (!discount) {
    throw new AppError(404, 'NOT_FOUND', 'Discount not found');
  }
  return formatDiscount(discount);
};

export const createDiscount = async (input: CreateDiscountInput) => {
  if (input.appliesTo === DiscountScope.PRODUCT && input.productId) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });
    if (!product) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Referenced product does not exist');
    }
  }

  const discount = await prisma.discount.create({
    data: {
      name: input.name,
      type: input.type,
      value: new Prisma.Decimal(input.value),
      minPurchase:
        input.minPurchase !== undefined && input.minPurchase !== null
          ? new Prisma.Decimal(input.minPurchase)
          : null,
      minQuantity: input.minQuantity,
      startDate: input.startDate,
      endDate: input.endDate,
      usageLimit: input.usageLimit,
      usedCount: 0,
      appliesTo: input.appliesTo,
      productId: input.appliesTo === DiscountScope.PRODUCT ? input.productId : null,
    },
  });

  return formatDiscount(discount);
};

export const updateDiscount = async (id: string, input: UpdateDiscountInput) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Discount not found');
  }

  const effectiveType = input.type ?? existing.type;
  const effectiveValue = input.value !== undefined ? input.value : existing.value.toNumber();

  if (effectiveType === DiscountType.PERCENT) {
    if (effectiveValue < 1 || effectiveValue > 100) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'For PERCENT discount type, value must be between 1 and 100'
      );
    }
  } else if (effectiveValue <= 0) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'For FIXED discount type, value must be greater than 0'
    );
  }

  const effectiveStartDate = input.startDate ?? existing.startDate;
  const effectiveEndDate = input.endDate ?? existing.endDate;

  if (effectiveEndDate < effectiveStartDate) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'endDate must be greater than or equal to startDate'
    );
  }

  const effectiveAppliesTo = input.appliesTo ?? existing.appliesTo;
  let effectiveProductId =
    input.productId !== undefined ? input.productId : existing.productId;

  if (effectiveAppliesTo === DiscountScope.PRODUCT) {
    if (!effectiveProductId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'appliesTo PRODUCT requires an existing productId'
      );
    }
    const product = await prisma.product.findUnique({
      where: { id: effectiveProductId },
    });
    if (!product) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Referenced product does not exist');
    }
  } else {
    effectiveProductId = null;
  }

  const discount = await prisma.discount.update({
    where: { id },
    data: {
      name: input.name,
      type: input.type,
      value: input.value !== undefined ? new Prisma.Decimal(input.value) : undefined,
      minPurchase:
        input.minPurchase !== undefined
          ? input.minPurchase !== null
            ? new Prisma.Decimal(input.minPurchase)
            : null
          : undefined,
      minQuantity: input.minQuantity,
      startDate: input.startDate,
      endDate: input.endDate,
      usageLimit: input.usageLimit,
      appliesTo: input.appliesTo,
      productId: effectiveProductId,
    },
  });

  return formatDiscount(discount);
};

export const deleteDiscount = async (id: string) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Discount not found');
  }

  const invoiceCount = await prisma.invoice.count({
    where: { discountId: id },
  });

  if (invoiceCount > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      'Cannot delete discount referenced by invoices'
    );
  }

  try {
    await prisma.discount.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Discount is referenced by other records');
    }
    throw error;
  }

  return { message: 'Discount deleted successfully' };
};

