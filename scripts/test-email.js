#!/usr/bin/env node

/**
 * Local Email Test Script
 *
 * Tests email sending using Outlook SMTP before deploying to CI/CD
 *
 * Usage:
 *   node scripts/test-email.js
 *
 * Environment variables required:
 *   NOTIFICATION_EMAIL - Your Outlook email address
 *   NOTIFICATION_EMAIL_PASSWORD - App password (not regular password!)
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const { NOTIFICATION_EMAIL, NOTIFICATION_EMAIL_PASSWORD } = process.env;

if (!NOTIFICATION_EMAIL || !NOTIFICATION_EMAIL_PASSWORD) {
  console.error('❌ Missing required environment variables!');
  console.error('');
  console.error('Please set:');
  console.error('  NOTIFICATION_EMAIL=your-email@outlook.com');
  console.error('  NOTIFICATION_EMAIL_PASSWORD=your-app-password');
  console.error('');
  console.error('To create an app password:');
  console.error('  1. Go to https://account.microsoft.com/security');
  console.error('  2. Advanced security options → App passwords');
  console.error('  3. Create a new app password');
  console.error('  4. Use that password (not your regular password)');
  process.exit(1);
}

async function testEmail() {
  console.log('📧 Testing email configuration...\n');
  console.log(`From: ${NOTIFICATION_EMAIL}`);
  console.log(`To: raverpay@outlook.com`);
  console.log(`Server: smtp-mail.outlook.com:587\n`);

  // Create transporter with Outlook SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: NOTIFICATION_EMAIL,
      pass: NOTIFICATION_EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // For testing only
    },
  });

  try {
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"RaverPay CI/CD" <${NOTIFICATION_EMAIL}>`,
      to: 'raverpay@outlook.com',
      subject: '✅ RaverPay Email Test - Local',
      text: `
This is a test email from the RaverPay CI/CD notification system.

If you received this email, the SMTP configuration is working correctly!

Test Details:
- Time: ${new Date().toISOString()}
- From: ${NOTIFICATION_EMAIL}
- Server: smtp-mail.outlook.com:587
      `.trim(),
      html: `
        <h2>✅ RaverPay Email Test - Local</h2>
        <p>This is a test email from the RaverPay CI/CD notification system.</p>
        <p>If you received this email, the SMTP configuration is working correctly!</p>
        <hr>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Time: ${new Date().toISOString()}</li>
          <li>From: ${NOTIFICATION_EMAIL}</li>
          <li>Server: smtp-mail.outlook.com:587</li>
        </ul>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('\n📬 Check your inbox at raverpay@outlook.com');
    console.log('   (It may take a few minutes to arrive)\n');
  } catch (error) {
    console.error('❌ Failed to send email!\n');
    console.error('Error details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Command: ${error.command}`);
    console.error(`   Response: ${error.response}`);
    console.error(`   Message: ${error.message}\n`);

    if (error.responseCode === 535) {
      console.error('🔧 Authentication Error (535):');
      console.error('   This usually means:');
      console.error("   1. You're using your regular password instead of an app password");
      console.error('   2. Basic authentication is disabled (use app password)');
      console.error('   3. Two-factor authentication is enabled (requires app password)\n');
      console.error('   Solution:');
      console.error('   → Create an app password at: https://account.microsoft.com/security');
      console.error('   → Use that app password as NOTIFICATION_EMAIL_PASSWORD\n');
    }

    process.exit(1);
  } finally {
    transporter.close();
  }
}

testEmail();
