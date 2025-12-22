# Process DUNS Email - Quick Guide

## Your Specific Email

**Email ID:** `81b60e18-ce71-4904-b56f-c53a31791aa0`  
**From:** dxbgird@dnbsame.com  
**To:** support@raverpay.com  
**Subject:** 9672165\_ RAVERPAY FINANCIAL TECHNOLOGY LIMITED_DUNS REGISTRATION_APPLE  
**Attachments:** 6 files (images + questionnaire)

---

## Option 1: Using the Script (Recommended)

This is the fastest way to process the email right now.

### Steps:

1. **Navigate to the API directory:**

```bash
cd apps/raverpay-api
```

2. **Run the script:**

```bash
npx ts-node scripts/process-missed-email.ts 81b60e18-ce71-4904-b56f-c53a31791aa0
```

3. **Wait for confirmation:**

```
🚀 Starting application...

📧 Processing email: 81b60e18-ce71-4904-b56f-c53a31791aa0

✅ Success!
{
  "success": true,
  "message": "Email fetched and processed successfully",
  "emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"
}

✨ Done!
```

---

## Option 2: Using the API Endpoint

If you prefer to use the API directly:

### 1. Get your admin JWT token

```bash
# Replace with your actual admin credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin-email@raverpay.com",
    "password": "your-password"
  }'
```

This returns:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Process the email

```bash
# Replace YOUR_TOKEN with the access_token from step 1
curl -X POST http://localhost:3001/api/admin/emails/process-from-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1N2QwOGViOS1kZGQ4LTQzMmMtOTIzMC04ZGVkNDhhNGVhNWYiLCJlbWFpbCI6Impvc2VwaGFkbWluQHJhdmVycGF5LmNvbSIsInBob25lIjoiKzIzNDcwMzA4NzUyMjYiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU0NDc1ODksImV4cCI6MTc2NTQ0OTM4OX0.Q1noPnrk6A3rwHwDj3Xfxu6dnrh13UwTRpY-PgX4vl0" \
  -d '{"emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"}'
```

---

## Option 3: Using Postman/Insomnia

### Request Details:

**Method:** POST  
**URL:** `http://localhost:3000/api/admin/emails/process-from-resend`  
**Headers:**

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON):**

```json
{
  "emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"
}
```

---

## What Will Happen

When you process this email:

1. ✅ **Fetches from Resend** - Gets the full email with all 6 attachments
2. ✅ **Stores in database** - Saves to `inbound_emails` table
3. ✅ **Creates ticket** - Auto-creates a support ticket (if routing configured)
4. ✅ **Creates conversation** - Links to a conversation thread
5. ✅ **Marks as processed** - Sets `isProcessed = true`

---

## After Processing

### View in Admin Dashboard

Once processed, you can view the email at:

```
http://localhost:3000/dashboard/support/emails
```

Or directly:

```
http://localhost:3000/dashboard/support/emails/{database-email-id}
```

### Reply to the Email

You can reply with attachments using the new file upload feature:

```bash
curl -X POST http://localhost:3000/api/admin/emails/{email-id}/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Thank you for your DUNS registration inquiry. We have received your questionnaire." \
  -F "attachments=@/path/to/response-document.pdf"
```

---

## Troubleshooting

### Issue: "Email not found in Resend"

The email might have been deleted or expired. Check your Resend dashboard at:
https://resend.com/emails

Search for the email ID: `81b60e18-ce71-4904-b56f-c53a31791aa0`

### Issue: "No active routing found"

You need to set up email routing for `support@raverpay.com`. Run this SQL:

```sql
INSERT INTO email_routing (
  id,
  "emailAddress",
  "targetRole",
  "autoCreateTicket",
  "defaultPriority",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::TEXT,
  'support@raverpay.com',
  'SUPPORT',
  true,
  'MEDIUM',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("emailAddress") DO NOTHING;
```

### Issue: "Resend client not initialized"

Make sure you have `RESEND_API_KEY` in your `.env` file:

```env
RESEND_API_KEY=re_your_key_here
```

---

## Next Steps

After processing this email:

1. ✅ Fix your webhook URL in Resend dashboard
2. ✅ Test with a new email to verify webhooks work
3. ✅ Reply to the DUNS registration email
4. ✅ Complete the DUNS questionnaire they sent
