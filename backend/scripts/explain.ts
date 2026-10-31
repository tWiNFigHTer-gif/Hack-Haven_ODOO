import { prisma } from '../src/db/prisma';

interface ExplainRow {
  'QUERY PLAN': string;
}

interface QueryTarget {
  name: string;
  sql: string;
}

async function main() {
  try {
    const sampleCustomer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      select: { id: true },
    });
    const customerId = sampleCustomer?.id || 'sample_customer_id';

    const queries: QueryTarget[] = [
      {
        name: '/reports/summary',
        sql: `EXPLAIN (ANALYZE, BUFFERS) SELECT status, count(*)::int as count, COALESCE(sum("total"), 0) as total FROM "Invoice" GROUP BY status`,
      },
      {
        name: '/reports/overdue',
        sql: `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM "Invoice" WHERE status = 'CONFIRMED' AND "dueDate" < NOW() ORDER BY "dueDate" ASC`,
      },
      {
        name: '/reports/invoices',
        sql: `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM "Invoice" ORDER BY "createdAt" DESC LIMIT 20`,
      },
      {
        name: '/me/invoices',
        sql: `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM "Invoice" WHERE "customerId" = '${customerId}' ORDER BY "createdAt" DESC LIMIT 20`,
      },
    ];

    console.log('=== EXPLAIN (ANALYZE, BUFFERS) Report ===');

    for (const q of queries) {
      const rows = await prisma.$queryRawUnsafe<ExplainRow[]>(q.sql);
      const planText = rows.map((r) => r['QUERY PLAN']).join('\n');

      const execTimeMatch = planText.match(/Execution [Tt]ime:\s*([\d.]+)\s*ms/);
      const executionTime = execTimeMatch ? `${execTimeMatch[1]} ms` : 'N/A';

      const seqScanMatch = planText.match(
        /Seq Scan on (?:")?(Invoice|Payment|Subscription)(?:")?/i
      );
      const hasSeqScan = !!seqScanMatch;
      const seqScanTable = seqScanMatch ? seqScanMatch[1] : null;

      console.log(`\nEndpoint: ${q.name}`);
      console.log(`Execution Time: ${executionTime}`);
      console.log(
        `Seq Scan on target tables (Invoice/Payment/Subscription): ${
          hasSeqScan ? `YES (${seqScanTable})` : 'NO'
        }`
      );
      console.log('Plan Details:');
      console.log(planText);
    }
  } catch (error) {
    console.error('Execution error in explain script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

