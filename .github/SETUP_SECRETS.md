# GitHub Secrets Setup Guide

To complete the CI/CD pipeline setup, you need to add the following secrets to your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## Required Secrets

### 1. `RAILWAY_TOKEN`

**Purpose:** Allows GitHub Actions to deploy to Railway

**How to get it:**

```bash
# Login to Railway CLI
railway login

# Generate a new token
railway token
```

Copy the token and add it as a GitHub secret.

---

### 2. `RESEND_API_KEY` ⭐ RECOMMENDED

**Purpose:** Resend API key for sending deployment notifications

**Why Resend?**

- ✅ More reliable than Outlook SMTP (no authentication issues)
- ✅ Already used in your application for transactional emails
- ✅ Better deliverability and tracking
- ✅ No app passwords or SMTP configuration needed

**How to get it:**

1. Go to https://resend.com and sign in (or create an account)
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Give it a name like "GitHub Actions CI/CD"
5. Copy the API key (starts with `re_`)
6. Add it as `RESEND_API_KEY` secret in GitHub

**Note:** You can use the same API key that's already configured in your Railway environment.

**Testing Locally:**

```bash
# Test Resend API
export RESEND_API_KEY="your-resend-api-key"
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: 'RaverPay CI/CD <noreply@expertvetteddigital.tech>',
  to: 'raverpay@outlook.com',
  subject: 'Test Email',
  text: 'This is a test email from RaverPay CI/CD'
}).then(r => console.log('✅ Email sent:', r.data)).catch(e => console.error('❌ Error:', e));
"
```

---

### 3. `NOTIFICATION_EMAIL` (Optional - Legacy SMTP)

**Purpose:** Email address for SMTP-based notifications (if not using Resend)

**Value:** `raverpay@outlook.com`

**Note:** Only needed if using SMTP instead of Resend. **Resend is recommended.**

---

### 4. `NOTIFICATION_EMAIL_PASSWORD` (Optional - Legacy SMTP)

**Purpose:** App-specific password for SMTP notifications (if not using Resend)

**⚠️ IMPORTANT:** Outlook/Office365 has disabled basic authentication for many accounts. Even with app passwords, SMTP may not work. **We strongly recommend using Resend instead.**

**Testing SMTP Locally:**

```bash
export NOTIFICATION_EMAIL="raverpay@outlook.com"
export NOTIFICATION_EMAIL_PASSWORD="your-app-password-here"
pnpm test:email
```

---

## Verify Secrets are Added

After adding all secrets, verify by:

1. Going to **Settings** → **Secrets and variables** → **Actions**
2. You should see at minimum:
   - `RAILWAY_TOKEN` (required)
   - `RESEND_API_KEY` (recommended for email notifications)

   Optional (if using SMTP instead of Resend):
   - `NOTIFICATION_EMAIL`
   - `NOTIFICATION_EMAIL_PASSWORD`

---

## Test the Pipeline

Once secrets are added:

1. Make a small change to any file
2. Commit and push to a feature branch
3. Create a Pull Request to `main`
4. The CI checks should run automatically
5. After merging to `main`, deployment should trigger

---

## Troubleshooting

### Railway Token Issues

If deployment fails with "unauthorized", regenerate the Railway token:

```bash
railway logout
railway login
railway token
```

### Email Notification Issues

**If using Resend (Recommended):**

- Verify `RESEND_API_KEY` is correct and active
- Check Resend dashboard for delivery status
- Ensure the API key has permission to send emails

**If using SMTP (Legacy):**

- Verify the email and password are correct
- If using 2FA, you MUST use an app password
- Note: Outlook may still block SMTP even with app passwords
- **Solution:** Switch to Resend API (recommended)
- Check the GitHub Actions logs for specific error messages

### Health Check Failing

- Verify your API is deployed correctly on Railway
- Check the Railway logs: `railway logs --service raverpay-api`
- Ensure the health endpoint is accessible: https://api.raverpay.com/api/health
