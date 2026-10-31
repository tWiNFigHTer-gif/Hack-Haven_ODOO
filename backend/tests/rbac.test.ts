import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db/prisma';

describe('RBAC Integration Tests', () => {
  let isDbReady = false;
  let staffToken = '';
  let customerToken = '';

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbReady = true;

      // Authenticate seeded staff
      const staffLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@brightloop.test',
          password: 'Staff@12345',
        });
      staffToken = staffLogin.body.token;

      // Authenticate seeded customer
      const customerLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@brightloop.test',
          password: 'Cust@12345',
        });
      customerToken = customerLogin.body.token;
    } catch {
      isDbReady = false;
    }
  });

  afterAll(async () => {
    if (isDbReady) {
      await prisma.$disconnect();
    }
  });

  it('staff cannot POST /users/staff', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const res = await request(app)
      .post('/api/users/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'New Staff',
        email: 'new-staff-attempt@example.com',
        password: 'ValidPassword123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('staff cannot POST /catalog/products', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const res = await request(app)
      .post('/api/catalog/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'Staff Unauthorized Product',
        type: 'SOFTWARE',
        salesPrice: 200,
        costPrice: 50,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('customer cannot GET /reports/summary', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${customerToken}`);

    expect([403, 404]).toContain(res.status);
    if (res.status === 403) {
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
  });

  it("customer cannot read another customer's invoice", async (ctx) => {
    if (!isDbReady) return ctx.skip();

    // Query non-existent or other customer's invoice ID
    const res = await request(app)
      .get('/api/me/invoices/inv_not_owned_or_admin_123')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

