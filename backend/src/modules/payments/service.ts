import {
  Payment,
  InvoiceStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error';
import { CreatePaymentInput, ListPaymentsQuery } from './schema';

interface LockedInvoiceRow {
  id: string;
  status: InvoiceStatus;
  total: Prisma.Decimal | string | number;
}

const formatPayment = (p: Payment) => ({
  id: p.id,
  invoiceId: p.invoiceId,
  method: p.method,
  amount: p.amount.toFixed(2),
  paidOn: p.paidOn.toISOString(),
  note: p.note,
  recordedById: p.recordedById,
});

export const recordPayment = async (
  input: CreatePaymentInput,
  recordedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const lockedRows = await tx.$queryRaw<LockedInvoiceRow[]>`
      SELECT "id", "status", "total"
      FROM "Invoice"
      WHERE "id" = ${input.invoiceId}
      FOR UPDATE
    `;

    if (!lockedRows || lockedRows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
    }

    const lockedInvoice = lockedRows[0];

    if (
      lockedInvoice.status === InvoiceStatus.DRAFT ||
      lockedInvoice.status === InvoiceStatus.CANCELLED ||
      lockedInvoice.status === InvoiceStatus.PAID
    ) {
      throw new AppError(
        409,
        'CONFLICT',
        `Cannot record payment for invoice with status '${lockedInvoice.status}'`
      );
    }

    const invoiceTotal = new Prisma.Decimal(lockedInvoice.total);

    const aggregateResult = await tx.payment.aggregate({
      where: { invoiceId: input.invoiceId },
      _sum: { amount: true },
    });

    const sumPaidBefore = aggregateResult._sum.amount ?? new Prisma.Decimal(0);
    const remainingBefore = invoiceTotal.minus(sumPaidBefore);

    const paymentAmount = new Prisma.Decimal(input.amount);

    if (paymentAmount.lte(0)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Payment amount must be greater than 0'
      );
    }

    if (paymentAmount.gt(remainingBefore)) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Payment amount of ${paymentAmount.toFixed(2)} exceeds remaining balance of ${remainingBefore.toFixed(2)}`
      );
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId: input.invoiceId,
        method: input.method,
        amount: paymentAmount,
        paidOn: input.paidOn,
        note: input.note,
        recordedById,
      },
    });

    const sumPaidAfter = sumPaidBefore.plus(paymentAmount);
    let newStatus: InvoiceStatus = lockedInvoice.status;

    if (sumPaidAfter.gte(invoiceTotal)) {
      newStatus = InvoiceStatus.PAID;
      await tx.invoice.update({
        where: { id: input.invoiceId },
        data: { status: InvoiceStatus.PAID },
      });
    }

    const remainingBalance = invoiceTotal.minus(sumPaidAfter);

    return {
      payment: formatPayment(payment),
      invoiceStatus: newStatus,
      remainingBalance: remainingBalance.toFixed(2),
    };
  });
};

export const listPayments = async (query: ListPaymentsQuery) => {
  const where: Prisma.PaymentWhereInput = {};
  if (query.invoiceId) {
    where.invoiceId = query.invoiceId;
  }

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { paidOn: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments.map(formatPayment),
    page: query.page,
    limit: query.limit,
    total,
  };
};
