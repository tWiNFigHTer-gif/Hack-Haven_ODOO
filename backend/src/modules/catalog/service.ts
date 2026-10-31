import { Product, ProductVariant, Plan, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import {
  PaginationQuery,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  CreatePlanInput,
  UpdatePlanInput,
} from './schema';

const formatProduct = (p: Product) => ({
  id: p.id,
  name: p.name,
  type: p.type,
  salesPrice: p.salesPrice.toFixed(2),
  costPrice: p.costPrice.toFixed(2),
  notes: p.notes,
});

const formatVariant = (v: ProductVariant) => ({
  id: v.id,
  productId: v.productId,
  attribute: v.attribute,
  value: v.value,
  extraPrice: v.extraPrice.toFixed(2),
});

const formatPlan = (pl: Plan) => ({
  id: pl.id,
  name: pl.name,
  price: pl.price.toFixed(2),
  billingPeriod: pl.billingPeriod,
  minQuantity: pl.minQuantity,
  startDate: pl.startDate.toISOString(),
  endDate: pl.endDate ? pl.endDate.toISOString() : null,
  autoClose: pl.autoClose,
  allowEarlyClose: pl.allowEarlyClose,
  allowPause: pl.allowPause,
  allowRenew: pl.allowRenew,
});

// ----------------------------------------------------
// Products
// ----------------------------------------------------
export const listProducts = async (query: PaginationQuery) => {
  const where: Prisma.ProductWhereInput = {};
  if (query.q && query.q.trim() !== '') {
    where.name = { contains: query.q.trim(), mode: 'insensitive' };
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map(formatProduct),
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { attribute: 'asc' },
      },
    },
  });

  if (!product) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  return {
    ...formatProduct(product),
    variants: product.variants.map((v) => ({
      ...formatVariant(v),
      finalPrice: product.salesPrice.plus(v.extraPrice).toFixed(2),
    })),
  };
};

export const createProduct = async (input: CreateProductInput) => {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      type: input.type,
      salesPrice: new Prisma.Decimal(input.salesPrice),
      costPrice: new Prisma.Decimal(input.costPrice),
      notes: input.notes,
    },
  });

  return formatProduct(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      type: input.type,
      salesPrice: input.salesPrice !== undefined ? new Prisma.Decimal(input.salesPrice) : undefined,
      costPrice: input.costPrice !== undefined ? new Prisma.Decimal(input.costPrice) : undefined,
      notes: input.notes,
    },
  });

  return formatProduct(product);
};

export const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  const [subscriptionLineCount, templateLineCount, discountCount, invoiceLineCount] =
    await Promise.all([
      prisma.subscriptionLine.count({ where: { productId: id } }),
      prisma.templateLine.count({ where: { productId: id } }),
      prisma.discount.count({ where: { productId: id } }),
      prisma.invoiceLine.count({ where: { productId: id } }),
    ]);

  if (
    subscriptionLineCount > 0 ||
    templateLineCount > 0 ||
    discountCount > 0 ||
    invoiceLineCount > 0
  ) {
    throw new AppError(
      409,
      'CONFLICT',
      'Cannot delete product referenced by active subscription lines, templates, discounts, or invoices'
    );
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Product is referenced by other records');
    }
    throw error;
  }

  return { message: 'Product deleted successfully' };
};

// ----------------------------------------------------
// Variants
// ----------------------------------------------------
export const listVariantsByProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { attribute: 'asc' },
  });

  return variants.map(formatVariant);
};

export const createVariant = async (productId: string, input: CreateVariantInput) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }

  const existing = await prisma.productVariant.findUnique({
    where: {
      productId_attribute_value: {
        productId,
        attribute: input.attribute,
        value: input.value,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      'CONFLICT',
      'Variant with this attribute and value already exists for this product'
    );
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      attribute: input.attribute,
      value: input.value,
      extraPrice: new Prisma.Decimal(input.extraPrice),
    },
  });

  return formatVariant(variant);
};

export const updateVariant = async (id: string, input: UpdateVariantInput) => {
  const existing = await prisma.productVariant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Variant not found');
  }

  const newAttribute = input.attribute ?? existing.attribute;
  const newValue = input.value ?? existing.value;

  if (newAttribute !== existing.attribute || newValue !== existing.value) {
    const duplicate = await prisma.productVariant.findUnique({
      where: {
        productId_attribute_value: {
          productId: existing.productId,
          attribute: newAttribute,
          value: newValue,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError(
        409,
        'CONFLICT',
        'Variant with this attribute and value already exists for this product'
      );
    }
  }

  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      attribute: input.attribute,
      value: input.value,
      extraPrice: input.extraPrice !== undefined ? new Prisma.Decimal(input.extraPrice) : undefined,
    },
  });

  return formatVariant(variant);
};

export const deleteVariant = async (id: string) => {
  const existing = await prisma.productVariant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Variant not found');
  }

  const [subscriptionLineCount, templateLineCount] = await Promise.all([
    prisma.subscriptionLine.count({ where: { variantId: id } }),
    prisma.templateLine.count({ where: { variantId: id } }),
  ]);

  if (subscriptionLineCount > 0 || templateLineCount > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      'Cannot delete variant referenced by subscription lines or templates'
    );
  }

  try {
    await prisma.productVariant.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Variant is referenced by other records');
    }
    throw error;
  }

  return { message: 'Variant deleted successfully' };
};

// ----------------------------------------------------
// Plans
// ----------------------------------------------------
export const listPlans = async (query: PaginationQuery) => {
  const where: Prisma.PlanWhereInput = {};
  if (query.q && query.q.trim() !== '') {
    where.name = { contains: query.q.trim(), mode: 'insensitive' };
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.plan.count({ where }),
  ]);

  return {
    data: plans.map(formatPlan),
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getPlanById = async (id: string) => {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError(404, 'NOT_FOUND', 'Plan not found');
  }

  return formatPlan(plan);
};

export const createPlan = async (input: CreatePlanInput) => {
  const plan = await prisma.plan.create({
    data: {
      name: input.name,
      price: new Prisma.Decimal(input.price),
      billingPeriod: input.billingPeriod,
      minQuantity: input.minQuantity,
      startDate: input.startDate,
      endDate: input.endDate,
      autoClose: input.autoClose,
      allowEarlyClose: input.allowEarlyClose,
      allowPause: input.allowPause,
      allowRenew: input.allowRenew,
    },
  });

  return formatPlan(plan);
};

export const updatePlan = async (id: string, input: UpdatePlanInput) => {
  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Plan not found');
  }

  const effectiveStartDate = input.startDate ?? existing.startDate;
  const effectiveEndDate = input.endDate !== undefined ? input.endDate : existing.endDate;

  if (effectiveEndDate && effectiveEndDate < effectiveStartDate) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'endDate must be greater than or equal to startDate'
    );
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      name: input.name,
      price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
      billingPeriod: input.billingPeriod,
      minQuantity: input.minQuantity,
      startDate: input.startDate,
      endDate: input.endDate,
      autoClose: input.autoClose,
      allowEarlyClose: input.allowEarlyClose,
      allowPause: input.allowPause,
      allowRenew: input.allowRenew,
    },
  });

  return formatPlan(plan);
};

export const deletePlan = async (id: string) => {
  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Plan not found');
  }

  const [subscriptionCount, templateCount] = await Promise.all([
    prisma.subscription.count({ where: { planId: id } }),
    prisma.quotationTemplate.count({ where: { planId: id } }),
  ]);

  if (subscriptionCount > 0 || templateCount > 0) {
    throw new AppError(
      409,
      'CONFLICT',
      'Cannot delete plan referenced by active subscriptions or quotation templates'
    );
  }

  try {
    await prisma.plan.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Plan is referenced by other records');
    }
    throw error;
  }

  return { message: 'Plan deleted successfully' };
};

