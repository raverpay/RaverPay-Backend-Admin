/**
 * Script to manually process a missed email from Resend
 *
 * Usage:
 *   npx ts-node scripts/process-missed-email.ts <email-id>
 *
 * Example:
 *   npx ts-node scripts/process-missed-email.ts 81b60e18-ce71-4904-b56f-c53a31791aa0
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ResendWebhookService } from '../src/webhooks/resend-webhook.service';

async function processEmail(emailId: string) {
  console.log('🚀 Starting application...');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get the webhook service
    const webhookService = app.get(ResendWebhookService);

    console.log(`\n📧 Processing email: ${emailId}\n`);

    // Process the email
    const result = await webhookService.manuallyProcessEmail(emailId);

    console.log('\n✅ Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Error processing email:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Get email ID from command line arguments
const emailId = process.argv[2];

if (!emailId) {
  console.error('❌ Error: Email ID is required');
  console.log('\nUsage:');
  console.log('  npx ts-node scripts/process-missed-email.ts <email-id>');
  console.log('\nExample:');
  console.log(
    '  npx ts-node scripts/process-missed-email.ts 81b60e18-ce71-4904-b56f-c53a31791aa0',
  );
  process.exit(1);
}

// Run the script
processEmail(emailId)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
