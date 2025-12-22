import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking CCTP Transfer ===');
  const cctpTransfer = await prisma.circleCCTPTransfer.findFirst({
    where: { reference: 'CCTP-1766347408812-29DB8349' },
  });
  console.log('CCTP Transfer:', JSON.stringify(cctpTransfer, null, 2));

  console.log('\n=== Checking CircleTransaction ===');
  const circleTransaction = await prisma.circleTransaction.findFirst({
    where: { refId: 'CCTP-1766347408812-29DB8349' },
  });
  console.log('CircleTransaction:', JSON.stringify(circleTransaction, null, 2));

  console.log('\n=== Checking Webhook Logs ===');
  const webhookLogs = await prisma.circleWebhookLog.findMany({
    where: {
      payload: {
        path: ['notification', 'refId'],
        equals: 'CCTP-1766347408812-29DB8349',
      },
    },
    orderBy: { receivedAt: 'asc' },
  });
  console.log(`Found ${webhookLogs.length} webhook logs`);
  webhookLogs.forEach((log, i) => {
    console.log(`\nWebhook ${i + 1}:`);
    console.log(`  ID: ${log.notificationId}`);
    console.log(`  Type: ${log.eventType}`);
    console.log(`  Processed: ${log.processed}`);
    console.log(`  Error: ${log.error || 'none'}`);
    console.log(`  Retry Count: ${log.retryCount}`);
    const notification = (log.payload as any).notification;
    console.log(`  State: ${notification?.state}`);
    console.log(`  Transaction ID: ${notification?.id}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
