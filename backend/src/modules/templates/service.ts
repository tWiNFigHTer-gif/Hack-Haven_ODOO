import { QuotationTemplate, TemplateLine, Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import {
  ListTemplatesQuery,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateLineInput,
} from './schema';

type TemplateWithLines = QuotationTemplate & {
  lines: TemplateLine[];
};

const formatTemplate = (t: TemplateWithLines) => ({
  id: t.id,
  name: t.name,
  validityDays: t.validityDays,
  planId: t.planId,
  lines: t.lines.map((l) => ({
    id: l.id,
    templateId: l.templateId,
    productId: l.productId,
    variantId: l.variantId,
    quantity: l.quantity,
  })),
});

const validateLines = async (
  lines: TemplateLineInput[],
  tx: Prisma.TransactionClient
) => {
  for (const line of lines) {
    const product = await tx.product.findUnique({
      where: { id: line.productId },
      include: { variants: true },
    });

    if (!product) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Product with id '${line.productId}' does not exist`
      );
    }

    if (line.variantId) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          `Variant '${line.variantId}' does not belong to product '${line.productId}'`
        );
      }
    }
  }
};

export const listTemplates = async (query: ListTemplatesQuery) => {
  const where: Prisma.QuotationTemplateWhereInput = {};
  if (query.q && query.q.trim() !== '') {
    where.name = { contains: query.q.trim(), mode: 'insensitive' };
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [templates, total] = await Promise.all([
    prisma.quotationTemplate.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { lines: true },
    }),
    prisma.quotationTemplate.count({ where }),
  ]);

  return {
    data: templates.map(formatTemplate),
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getTemplateById = async (id: string) => {
  const template = await prisma.quotationTemplate.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!template) {
    throw new AppError(404, 'NOT_FOUND', 'Quotation template not found');
  }

  return formatTemplate(template);
};

export const createTemplate = async (input: CreateTemplateInput) => {
  return prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findUnique({ where: { id: input.planId } });
    if (!plan) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Referenced plan does not exist');
    }

    await validateLines(input.lines, tx);

    const template = await tx.quotationTemplate.create({
      data: {
        name: input.name,
        validityDays: input.validityDays,
        planId: input.planId,
        lines: {
          create: input.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: l.quantity,
          })),
        },
      },
      include: { lines: true },
    });

    return formatTemplate(template);
  });
};

export const updateTemplate = async (id: string, input: UpdateTemplateInput) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.quotationTemplate.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Quotation template not found');
    }

    if (input.planId && input.planId !== existing.planId) {
      const plan = await tx.plan.findUnique({ where: { id: input.planId } });
      if (!plan) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Referenced plan does not exist');
      }
    }

    if (input.lines !== undefined) {
      await validateLines(input.lines, tx);

      await tx.templateLine.deleteMany({ where: { templateId: id } });

      if (input.lines.length > 0) {
        await tx.templateLine.createMany({
          data: input.lines.map((l) => ({
            templateId: id,
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: l.quantity,
          })),
        });
      }
    }

    const updated = await tx.quotationTemplate.update({
      where: { id },
      data: {
        name: input.name,
        validityDays: input.validityDays,
        planId: input.planId,
      },
      include: { lines: true },
    });

    return formatTemplate(updated);
  });
};

export const deleteTemplate = async (id: string) => {
  const existing = await prisma.quotationTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Quotation template not found');
  }

  try {
    await prisma.quotationTemplate.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(409, 'CONFLICT', 'Quotation template is referenced by other records');
    }
    throw error;
  }

  return { message: 'Quotation template deleted successfully' };
};

