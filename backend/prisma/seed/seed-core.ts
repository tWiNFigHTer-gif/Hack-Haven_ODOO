import {
  PrismaClient,
  Role,
  BillingPeriod,
  DiscountType,
  DiscountScope,
  Prisma,
} from '@prisma/client';
import { hash } from '../../src/utils/password';

export async function seedCore(prisma: PrismaClient): Promise<void> {
  const today = new Date();
  const oneYearFromNow = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

  // 1. Users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@brightloop.test',
      password: 'Admin@12345',
      role: Role.ADMIN,
    },
    {
      name: 'Staff User',
      email: 'staff@brightloop.test',
      password: 'Staff@12345',
      role: Role.STAFF,
    },
    {
      name: 'Customer User',
      email: 'customer@brightloop.test',
      password: 'Cust@12345',
      role: Role.CUSTOMER,
    },
  ];

  for (const user of users) {
    const passwordHash = await hash(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        isActive: true,
      },
    });
  }

  // 2. Products
  const products = [
    {
      name: 'CRM Suite',
      type: 'SOFTWARE',
      salesPrice: 1000,
      costPrice: 400,
    },
    {
      name: 'Helpdesk',
      type: 'SOFTWARE',
      salesPrice: 600,
      costPrice: 250,
    },
    {
      name: 'Analytics Add-on',
      type: 'ADDON',
      salesPrice: 300,
      costPrice: 100,
    },
  ];

  const seededProducts: Record<string, { id: string }> = {};

  for (const p of products) {
    let product = await prisma.product.findFirst({
      where: { name: p.name },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: p.name,
          type: p.type,
          salesPrice: new Prisma.Decimal(p.salesPrice),
          costPrice: new Prisma.Decimal(p.costPrice),
        },
      });
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          type: p.type,
          salesPrice: new Prisma.Decimal(p.salesPrice),
          costPrice: new Prisma.Decimal(p.costPrice),
        },
      });
    }

    seededProducts[p.name] = product;
  }

  // 3. Variant on CRM Suite
  const crmSuite = seededProducts['CRM Suite'];
  if (crmSuite) {
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: crmSuite.id,
        value: 'Odoo',
      },
    });

    if (!existingVariant) {
      await prisma.productVariant.create({
        data: {
          productId: crmSuite.id,
          attribute: 'Edition',
          value: 'Odoo',
          extraPrice: new Prisma.Decimal(560),
        },
      });
    } else {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          attribute: 'Edition',
          extraPrice: new Prisma.Decimal(560),
        },
      });
    }
  }

  // 4. Plans
  const plans = [
    {
      name: 'Monthly Basic',
      price: 999,
      billingPeriod: BillingPeriod.MONTHLY,
      startDate: today,
      endDate: null,
    },
    {
      name: 'Yearly Pro',
      price: 9999,
      billingPeriod: BillingPeriod.YEARLY,
      startDate: today,
      endDate: null,
    },
    {
      name: 'Weekly Trial',
      price: 199,
      billingPeriod: BillingPeriod.WEEKLY,
      startDate: today,
      endDate: null,
    },
  ];

  for (const pl of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: pl.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: {
          name: pl.name,
          price: new Prisma.Decimal(pl.price),
          billingPeriod: pl.billingPeriod,
          startDate: pl.startDate,
          endDate: pl.endDate,
        },
      });
    } else {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: {
          price: new Prisma.Decimal(pl.price),
          billingPeriod: pl.billingPeriod,
          startDate: pl.startDate,
          endDate: pl.endDate,
        },
      });
    }
  }

  // 5. Tax (GST 18%)
  const existingTax = await prisma.tax.findFirst({
    where: { name: 'GST' },
  });

  if (!existingTax) {
    await prisma.tax.create({
      data: {
        name: 'GST',
        ratePercent: new Prisma.Decimal(18),
      },
    });
  } else {
    await prisma.tax.update({
      where: { id: existingTax.id },
      data: {
        ratePercent: new Prisma.Decimal(18),
      },
    });
  }

  // 6. Discounts
  const discounts = [
    {
      name: 'Volume 10%',
      type: DiscountType.PERCENT,
      value: 10,
      minPurchase: null,
      minQuantity: 5,
      appliesTo: DiscountScope.SUBSCRIPTION,
      startDate: today,
      endDate: oneYearFromNow,
      usageLimit: null,
    },
    {
      name: 'Flat 500',
      type: DiscountType.FIXED,
      value: 500,
      minPurchase: 5000,
      minQuantity: null,
      appliesTo: DiscountScope.SUBSCRIPTION,
      startDate: today,
      endDate: oneYearFromNow,
      usageLimit: 100,
    },
  ];

  for (const d of discounts) {
    const existingDiscount = await prisma.discount.findFirst({
      where: { name: d.name },
    });

    if (!existingDiscount) {
      await prisma.discount.create({
        data: {
          name: d.name,
          type: d.type,
          value: new Prisma.Decimal(d.value),
          minPurchase: d.minPurchase !== null ? new Prisma.Decimal(d.minPurchase) : null,
          minQuantity: d.minQuantity,
          appliesTo: d.appliesTo,
          startDate: d.startDate,
          endDate: d.endDate,
          usageLimit: d.usageLimit,
        },
      });
    } else {
      await prisma.discount.update({
        where: { id: existingDiscount.id },
        data: {
          type: d.type,
          value: new Prisma.Decimal(d.value),
          minPurchase: d.minPurchase !== null ? new Prisma.Decimal(d.minPurchase) : null,
          minQuantity: d.minQuantity,
          appliesTo: d.appliesTo,
          startDate: d.startDate,
          endDate: d.endDate,
          usageLimit: d.usageLimit,
        },
      });
    }
  }
}
