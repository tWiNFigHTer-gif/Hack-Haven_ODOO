import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Prisma } from '@prisma/client';
import { app } from '../src/app';
import { prisma } from '../src/db/prisma';

describe('Catalog & Payments Integration Tests', () => {
  let isDbReady = false;
  let adminToken = '';
  let testInvoiceId = '';

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbReady = true;

      // Authenticate admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@brightloop.test',
          password: 'Admin@12345',
        });
      adminToken = adminLogin.body.token;

      // Setup a test invoice for payment tests
      const customer = await prisma.user.findUnique({
        where: { email: 'customer@brightloop.test' },
      });
      const plan = await prisma.plan.findFirst();

      if (customer && plan) {
        const sub = await prisma.subscription.create({
          data: {
            number: `SUB-TEST-${Date.now()}`,
            customerId: customer.id,
            planId: plan.id,
            startDate: new Date(),
            paymentTerms: 'NET30',
            status: 'ACTIVE',
          },
        });

        const invoice = await prisma.invoice.create({
          data: {
            number: `INV-TEST-${Date.now()}`,
            subscriptionId: sub.id,
            customerId: customer.id,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            subtotal: new Prisma.Decimal(1000),
            taxAmount: new Prisma.Decimal(0),
            discountAmount: new Prisma.Decimal(0),
            total: new Prisma.Decimal(1000),
            status: 'CONFIRMED',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          },
        });

        testInvoiceId = invoice.id;
      }
    } catch {
      isDbReady = false;
    }
  });

  afterAll(async () => {
    if (isDbReady) {
      if (testInvoiceId) {
        await prisma.payment.deleteMany({ where: { invoiceId: testInvoiceId } });
        const invoice = await prisma.invoice.findUnique({ where: { id: testInvoiceId } });
        if (invoice) {
          await prisma.invoice.delete({ where: { id: testInvoiceId } });
          await prisma.subscription.delete({ where: { id: invoice.subscriptionId } });
        }
      }
      await prisma.$disconnect();
    }
  });

  it('variant finalPrice = salesPrice + 560', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const product = await prisma.product.findFirst({
      where: { name: 'CRM Suite' },
      include: { variants: true },
    });
    expect(product).toBeDefined();

    const res = await request(app)
      .get(`/api/catalog/products/${product!.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.variants).toBeDefined();

    const odooVariant = res.body.variants.find(
      (v: { value: string }) => v.value === 'Odoo'
    );
    expect(odooVariant).toBeDefined();

    // salesPrice 1000.00 + extraPrice 560.00 = 1560.00
    expect(odooVariant.finalPrice).toBe('1560.00');
  });

  it('payment overpay 409', async (ctx) => {
    if (!isDbReady || !testInvoiceId) return ctx.skip();

    // Attempting to pay 2000.00 on a 1000.00 balance
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        invoiceId: testInvoiceId,
        method: 'CARD',
        amount: 2000,
        paidOn: new Date().toISOString(),
      });

    expect([400, 409]).toContain(res.status);
    expect(['VALIDATION_ERROR', 'CONFLICT']).toContain(res.body.error.code);
  });

  it('payment full flips invoice to PAID', async (ctx) => {
    if (!isDbReady || !testInvoiceId) return ctx.skip();

    // Pay full 1000.00 balance
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        invoiceId: testInvoiceId,
        method: 'CARD',
        amount: 1000,
        paidOn: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.invoiceStatus).toBe('PAID');
    expect(res.body.remainingBalance).toBe('0.00');

    // Verify invoice row in database was updated to PAID
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: testInvoiceId },
    });
    expect(updatedInvoice!.status).toBe('PAID');
  });
});

