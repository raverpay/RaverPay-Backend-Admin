# Scripts Directory

This directory contains utility scripts for local development and testing.

## Email Test Script

### Purpose

Test email sending configuration locally before deploying to CI/CD. This helps catch SMTP authentication issues early.

### Prerequisites

1. Install dependencies: `pnpm install`
2. Create an Outlook app password (see instructions below)

### Usage

```bash
# Set environment variables
export NOTIFICATION_EMAIL="raverpay@outlook.com"
export NOTIFICATION_EMAIL_PASSWORD="your-app-password-here"

# Run the test
pnpm test:email
```

Or using a `.env` file (create one in the root directory):

```bash
# .env
NOTIFICATION_EMAIL=raverpay@outlook.com
NOTIFICATION_EMAIL_PASSWORD=your-app-password-here
```

Then run:

```bash
pnpm test:email
```

### Creating an Outlook App Password

**⚠️ IMPORTANT:** Outlook requires an app password, NOT your regular password!

1. Go to https://account.microsoft.com/security
2. Click **Advanced security options**
3. Under **App passwords**, click **Create a new app password**
   - If you don't see this option, enable 2FA first
4. Name it "GitHub Actions CI/CD" or similar
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)
6. Use this password as `NOTIFICATION_EMAIL_PASSWORD`

### Troubleshooting

**Error: "535 5.7.139 Authentication unsuccessful"**

- You're using your regular password instead of an app password
- Solution: Create and use an app password (see above)

**Error: "Connection timeout"**

- Check your internet connection
- Verify SMTP server: `smtp-mail.outlook.com:587`

**Email not received**

- Check spam/junk folder
- Wait a few minutes (email delivery can be delayed)
- Verify the recipient email address is correct

### What the Script Does

1. Verifies SMTP connection to Outlook
2. Sends a test email to `raverpay@outlook.com`
3. Displays success/failure with detailed error messages
4. Provides helpful troubleshooting tips
