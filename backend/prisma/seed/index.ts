import fs from 'fs';
import path from 'path';
import { prisma } from '../../src/db/prisma';
import { seedCore } from './seed-core';

async function main() {
  await seedCore(prisma);

  const bulkPathTs = path.join(__dirname, 'seed-bulk.ts');
  const bulkPathJs = path.join(__dirname, 'seed-bulk.js');

  if (fs.existsSync(bulkPathTs) || fs.existsSync(bulkPathJs)) {
    const bulkModule = await import('./seed-bulk');
    const seedBulk = bulkModule.default || bulkModule.seedBulk;
    if (typeof seedBulk === 'function') {
      await seedBulk(prisma);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

