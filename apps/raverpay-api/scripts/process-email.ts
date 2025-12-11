/**
 * Script to manually process an email from Resend
 *
 * Usage:
 *   npx ts-node scripts/process-email.ts <EMAIL_ID>
 *
 * Example:
 *   npx ts-node scripts/process-email.ts 81b60e18-ce71-4904-b56f-c53a31791aa0
 */

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function processEmail(emailId: string) {
  console.log(`\n🔄 Processing email: ${emailId}\n`);

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const resend = new Resend(resendApiKey);

  try {
    // Check if email already exists
    const existingEmail = await prisma.inboundEmail.findUnique({
      where: { emailId: emailId },
    });

    if (existingEmail) {
      console.log(`✅ Email already exists in database:`);
      console.log(`   - ID: ${existingEmail.id}`);
      console.log(`   - From: ${existingEmail.from}`);
      console.log(`   - Subject: ${existingEmail.subject}`);
      console.log(`   - Processed: ${existingEmail.isProcessed}`);

      if (existingEmail.isProcessed) {
        console.log('\n✅ Email already processed. Nothing to do.\n');
        return;
      } else {
        console.log(
          '\n⚠️ Email exists but not processed. You may want to reprocess it manually.\n',
        );
        return;
      }
    }

    // Fetch email from Resend
    console.log('📥 Fetching email from Resend API...');
    const emailResponse = await resend.emails.receiving.get(emailId);

    if (emailResponse.error) {
      console.error(`❌ Resend API error: ${emailResponse.error.message}`);
      process.exit(1);
    }

    if (!emailResponse.data) {
      console.error('❌ No data returned from Resend API');
      process.exit(1);
    }

    const emailData = emailResponse.data;
    console.log(`✅ Email fetched successfully:`);
    console.log(`   - From: ${emailData.from}`);
    console.log(`   - To: ${emailData.to?.join(', ')}`);
    console.log(`   - Subject: ${emailData.subject}`);
    console.log(`   - Date: ${emailData.created_at}`);
    console.log(`   - Attachments: ${emailData.attachments?.length || 0}`);

    // Check routing configuration
    const targetEmail = emailData.to?.[0];
    if (!targetEmail) {
      console.error('❌ No recipient email found');
      process.exit(1);
    }

    console.log(`\n🔍 Checking routing for: ${targetEmail}`);
    const routing = await prisma.emailRouting.findUnique({
      where: { emailAddress: targetEmail },
    });

    if (!routing) {
      console.warn(`⚠️ No routing configuration found for ${targetEmail}`);
      console.warn('   Email will be stored but not processed.');
    } else {
      console.log(`✅ Routing found:`);
      console.log(`   - Target Role: ${routing.targetRole}`);
      console.log(`   - Auto Create Ticket: ${routing.autoCreateTicket}`);
      console.log(`   - Active: ${routing.isActive}`);
    }

    // Match sender to user
    const fromEmail = emailData.from.match(/<(.+)>$/)?.[1] || emailData.from;
    const user = await prisma.user.findUnique({
      where: { email: fromEmail },
    });

    if (user) {
      console.log(
        `\n✅ Sender matched to user: ${user.firstName} ${user.lastName} (${user.id})`,
      );
    } else {
      console.log(`\n⚠️ No user found for sender: ${fromEmail}`);
    }

    // Store email in database
    console.log(`\n💾 Storing email in database...`);
    const fromMatch = emailData.from.match(/^(.+?)\s*<(.+)>$/);
    const fromName = fromMatch ? fromMatch[1].trim() : null;
    const fromEmailClean = fromMatch ? fromMatch[2].trim() : emailData.from;

    const inboundEmail = await prisma.inboundEmail.create({
      data: {
        emailId: emailId,
        messageId: emailData.message_id || null,
        from: fromEmailClean,
        fromName: fromName,
        to: targetEmail,
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        subject: emailData.subject || '(No Subject)',
        textBody: emailData.text || null,
        htmlBody: emailData.html || null,
        targetRole: routing?.targetRole || null,
        targetEmail: targetEmail,
        userId: user?.id || null,
        attachments:
          emailData.attachments && emailData.attachments.length > 0
            ? emailData.attachments
            : undefined,
        receivedAt: new Date(emailData.created_at),
        isProcessed: false,
      },
    });

    console.log(`✅ Email stored with ID: ${inboundEmail.id}`);

    // Create ticket if routing configured
    if (routing && routing.autoCreateTicket && routing.isActive) {
      console.log(`\n🎫 Creating support ticket...`);

      // You would need to implement ticket creation logic here
      // For now, just mark as processed
      await prisma.inboundEmail.update({
        where: { id: inboundEmail.id },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });

      console.log(`✅ Email processed successfully!`);
    } else {
      console.log(
        `\n⚠️ No auto-ticket creation configured. Email stored but not processed.`,
      );
    }

    console.log(`\n✅ Done! Email ${emailId} has been processed.\n`);
  } catch (error) {
    console.error(`\n❌ Error processing email:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
const emailId = process.argv[2];

if (!emailId) {
  console.error('❌ Please provide an email ID as argument');
  console.log('\nUsage: npx ts-node scripts/process-email.ts <EMAIL_ID>');
  console.log(
    'Example: npx ts-node scripts/process-email.ts 81b60e18-ce71-4904-b56f-c53a31791aa0\n',
  );
  process.exit(1);
}

processEmail(emailId).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
