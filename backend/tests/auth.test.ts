import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { app } from '../src/app';
import { prisma } from '../src/db/prisma';

describe('Auth Module Integration Tests', () => {
  let isDbReady = false;

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbReady = true;
    } catch {
      isDbReady = false;
    }
  });

  afterAll(async () => {
    if (isDbReady) {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'new-valid-user@example.com',
              'pwd-fail-test@example.com',
            ],
          },
        },
      });
      await prisma.$disconnect();
    }
  });

  it('password rule fails/passes', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    // 1. Password fails: too short (<9 chars)
    const failResShort = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Short Pwd',
        email: 'pwd-short@example.com',
        password: 'Pass1!',
      });
    expect(failResShort.status).toBe(400);
    expect(failResShort.body.error.code).toBe('VALIDATION_ERROR');

    // 2. Password fails: no uppercase
    const failResUpper = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'No Upper',
        email: 'pwd-upper@example.com',
        password: 'lowercase123!',
      });
    expect(failResUpper.status).toBe(400);
    expect(failResUpper.body.error.code).toBe('VALIDATION_ERROR');

    // 3. Password fails: no special character
    const failResSpecial = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'No Special',
        email: 'pwd-special@example.com',
        password: 'Password123',
      });
    expect(failResSpecial.status).toBe(400);
    expect(failResSpecial.body.error.code).toBe('VALIDATION_ERROR');

    // 4. Password passes: >=9 chars, uppercase, lowercase, special char
    const passRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Valid User',
        email: 'new-valid-user@example.com',
        password: 'ValidPassword123!',
      });
    expect(passRes.status).toBe(201);
    expect(passRes.body.user).toBeDefined();
    expect(passRes.body.user.passwordHash).toBeUndefined();
  });

  it('duplicate email 409', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Duplicate Admin',
        email: 'admin@brightloop.test',
        password: 'AdminPassword123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('login bad creds 401', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    // Wrong password for existing user
    const wrongPwdRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@brightloop.test',
        password: 'WrongPassword123!',
      });
    expect(wrongPwdRes.status).toBe(401);
    expect(wrongPwdRes.body.error.code).toBe('UNAUTHENTICATED');

    // Non-existent email
    const unknownUserRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@brightloop.test',
        password: 'SomePassword123!',
      });
    expect(unknownUserRes.status).toBe(401);
    expect(unknownUserRes.body.error.code).toBe('UNAUTHENTICATED');

    // Identical error message to prevent enumeration
    expect(wrongPwdRes.body.error.message).toBe(unknownUserRes.body.error.message);
  });

  it('reset token single-use', async (ctx) => {
    if (!isDbReady) return ctx.skip();

    const customer = await prisma.user.findUnique({
      where: { email: 'customer@brightloop.test' },
    });
    expect(customer).toBeDefined();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: customer!.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // First use: succeeds
    const firstUseRes = await request(app)
      .post('/api/auth/reset')
      .send({
        token: rawToken,
        password: 'NewPassword123!',
      });
    expect(firstUseRes.status).toBe(200);

    // Second use: fails because token is marked used
    const secondUseRes = await request(app)
      .post('/api/auth/reset')
      .send({
        token: rawToken,
        password: 'AnotherPassword123!',
      });
    expect(secondUseRes.status).toBe(400);
    expect(secondUseRes.body.error.code).toBe('VALIDATION_ERROR');
  });
});

