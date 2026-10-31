import {
  Subscription,
  SubscriptionLine,
  Invoice,
  InvoiceLine,
  Payment,
  InvoiceStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';

interface PaginationParams {
  page: number;
  limit: number;
}

interface InvoicesQueryParams extends PaginationParams {
  status?: InvoiceStatus;
}

const formatSubscriptionLine = (l: SubscriptionLine) => ({
  id: l.id,
  subscriptionId: l.subscriptionId,
  productId: l.productId,
  variantId: l.variantId,
  quantity: l.quantity,
  unitPrice: l.unitPrice.toFixed(2),
  taxId: l.taxId,
  amount: l.amount.toFixed(2),
});

const formatSubscription = (
  s: Subscription & {
    plan: { name: string };
    lines: SubscriptionLine[];
  }
) => ({
  id: s.id,
  number: s.number,
  customerId: s.customerId,
  planId: s.planId,
  planName: s.plan.name,
  startDate: s.startDate.toISOString(),
  expiryDate: s.expiryDate ? s.expiryDate.toISOString() : null,
  paymentTerms: s.paymentTerms,
  status: s.status,
  nextBillingDate: s.nextBillingDate ? s.nextBillingDate.toISOString() : null,
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
  lines: s.lines.map(formatSubscriptionLine),
});

const formatInvoice = (inv: Invoice) => ({
  id: inv.id,
  number: inv.number,
  subscriptionId: inv.subscriptionId,
  customerId: inv.customerId,
  periodStart: inv.periodStart.toISOString(),
  periodEnd: inv.periodEnd.toISOString(),
  subtotal: inv.subtotal.toFixed(2),
  discountAmount: inv.discountAmount.toFixed(2),
  taxAmount: inv.taxAmount.toFixed(2),
  total: inv.total.toFixed(2),
  discountId: inv.discountId,
  status: inv.status,
  dueDate: inv.dueDate.toISOString(),
  createdAt: inv.createdAt.toISOString(),
});

const formatInvoiceLine = (l: InvoiceLine) => ({
  id: l.id,
  invoiceId: l.invoiceId,
  productId: l.productId,
  description: l.description,
  quantity: l.quantity,
  unitPrice: l.unitPrice.toFixed(2),
  taxAmount: l.taxAmount.toFixed(2),
  amount: l.amount.toFixed(2),
});

const formatPayment = (p: Payment) => ({
  id: p.id,
  invoiceId: p.invoiceId,
  method: p.method,
  amount: p.amount.toFixed(2),
  paidOn: p.paidOn.toISOString(),
  note: p.note,
  recordedById: p.recordedById,
});

export const getMySubscriptions = async (
  customerId: string,
  params: PaginationParams
) => {
  const where: Prisma.SubscriptionWhereInput = { customerId };
  const skip = (params.page - 1) * params.limit;
  const take = params.limit;

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: { name: true },
        },
        lines: true,
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    data: subscriptions.map(formatSubscription),
    page: params.page,
    limit: params.limit,
    total,
  };
};

export const getMyInvoices = async (
  customerId: string,
  params: InvoicesQueryParams
) => {
  const where: Prisma.InvoiceWhereInput = { customerId };
  if (params.status) {
    where.status = params.status;
  }

  const skip = (params.page - 1) * params.limit;
  const take = params.limit;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    data: invoices.map(formatInvoice),
    page: params.page,
    limit: params.limit,
    total,
  };
};

export const getMyInvoiceById = async (
  customerId: string,
  invoiceId: string
) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lines: true,
      payments: {
        orderBy: { paidOn: 'desc' },
      },
    },
  });

  if (!invoice || invoice.customerId !== customerId) {
    throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
  }

  return {
    ...formatInvoice(invoice),
    lines: invoice.lines.map(formatInvoiceLine),
    payments: invoice.payments.map(formatPayment),
  };
};

