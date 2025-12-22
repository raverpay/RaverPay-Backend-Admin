# Email Processing Guide

## Processing Missed Webhook Emails

If you misconfigured the webhook URL and emails weren't processed, you can manually recover them.

### Method 1: Using the Admin API Endpoint

**Endpoint:** `POST /api/admin/emails/process-from-resend`

**Required Role:** ADMIN or SUPER_ADMIN

**Request Body:**

```json
{
  "emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"
}
```

**Example cURL:**

```bash
curl -X POST https://your-api-url.com/api/admin/emails/process-from-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{"emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Email fetched and processed successfully",
  "emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"
}
```

### What Happens When You Process an Email:

1. **Fetches email from Resend API** - Gets full email content including body and attachments
2. **Stores in database** - Saves to `inbound_emails` table
3. **Checks routing rules** - Looks up configuration for the target email (e.g., support@raverpay.com)
4. **Creates ticket/conversation** - If `autoCreateTicket = true` in routing config
5. **Matches user** - Links to existing user if sender email matches a registered user
6. **Marks as processed** - Sets `isProcessed = true`

### Processing Your Specific Email (DUNS Registration)

For the email ID `81b60e18-ce71-4904-b56f-c53a31791aa0`:

```bash
# 1. Get your admin JWT token by logging in
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin-email@example.com",
    "password": "your-password"
  }'

# 2. Use the returned token to process the email
curl -X POST https://your-api-url.com/api/admin/emails/process-from-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"emailId": "81b60e18-ce71-4904-b56f-c53a31791aa0"}'
```

---

## Replying to Emails with Attachments

You can now send file attachments when replying to inbound emails.

### Endpoint

**POST** `/api/admin/emails/:emailId/reply`

**Content-Type:** `multipart/form-data`

### Parameters

| Field         | Type   | Required | Description                                         |
| ------------- | ------ | -------- | --------------------------------------------------- |
| `content`     | string | Yes      | HTML or plain text reply content                    |
| `subject`     | string | No       | Custom subject (defaults to "Re: Original Subject") |
| `attachments` | file[] | No       | Up to 5 files, max 10MB each                        |

### Example: Reply with Attachments

**Using cURL:**

```bash
curl -X POST https://your-api-url.com/api/admin/emails/abc-123-email-id/reply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=Thank you for your inquiry. Please see attached documents." \
  -F "attachments=@/path/to/document1.pdf" \
  -F "attachments=@/path/to/document2.docx"
```

**Using JavaScript (FormData):**

```javascript
const formData = new FormData();
formData.append(
  'content',
  'Thank you for your inquiry. Please see attached documents.',
);

// Add multiple files
const file1 = document.getElementById('file-input-1').files[0];
const file2 = document.getElementById('file-input-2').files[0];
formData.append('attachments', file1);
formData.append('attachments', file2);

const response = await fetch(`/api/admin/emails/${emailId}/reply`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Using Axios:**

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('content', 'Thank you for your inquiry.');
formData.append('attachments', file1);
formData.append('attachments', file2);

const response = await axios.post(
  `/api/admin/emails/${emailId}/reply`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  },
);
```

### Attachment Limits

- **Maximum files:** 5 per email
- **Maximum file size:** 10MB per file
- **Total size:** 50MB max (5 × 10MB)

### Response

```json
{
  "success": true,
  "message": "Reply sent successfully",
  "resendEmailId": "xyz-456-resend-id"
}
```

### What Happens:

1. Files are uploaded as multipart form data
2. Files are converted to base64 for Resend API
3. Email is sent with attachments via Resend
4. Reply is stored in conversation with attachment metadata
5. Original email is marked as processed

---

## Frontend Implementation (Next.js)

### Example: Email Reply Form with File Upload

```typescript
// app/dashboard/support/emails/[id]/reply-form.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ReplyFormProps {
  emailId: string;
  onSuccess?: () => void;
}

export function EmailReplyForm({ emailId, onSuccess }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file count
    if (selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files exceed 10MB limit');
      return;
    }

    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);

      // Append all files
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`/api/admin/emails/${emailId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`, // Your auth token
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send reply');

      toast.success('Reply sent successfully!');
      setContent('');
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to send reply');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Reply Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Attachments (Optional)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full"
          accept="*/*"
        />
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, idx) => (
              <div key={idx} className="text-sm text-gray-600">
                📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  );
}
```

---

## Troubleshooting

### Email Not Found in Resend

**Error:** `Resend API error: Email not found`

**Causes:**

- Email ID is incorrect
- Email was deleted from Resend
- Email is older than Resend's retention period (30 days for free plan)

**Solution:** Check the Resend dashboard to verify the email exists.

### System Email Filtered Out

**Issue:** Email from `donotreply@iresearch.dnb.com` is being filtered

The webhook service automatically filters out system emails matching these patterns:

- `noreply@*`
- `no-reply@*`
- `donotreply@*`
- `donot-reply@*`
- `system@*`
- `automated@*`

**Solution:** If you need to process system emails, you can temporarily comment out the filter in `resend-webhook.service.ts` (lines 107-130) or update the patterns.

### No Routing Configuration

**Error:** `No active routing found for support@raverpay.com`

**Solution:** Ensure email routing is configured in the database:

```sql
SELECT * FROM email_routing WHERE "emailAddress" = 'support@raverpay.com';
```

If missing, add it:

```sql
INSERT INTO email_routing (id, "emailAddress", "targetRole", "autoCreateTicket", "defaultPriority", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::TEXT,
  'support@raverpay.com',
  'SUPPORT',
  true,
  'MEDIUM',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

---

## Next Steps

1. **Process the DUNS email** using the manual processing endpoint
2. **Update webhook URL** in Resend dashboard to the correct endpoint
3. **Test with a new email** to verify webhooks are working
4. **Implement the frontend form** for file attachments in your admin dashboard
5. **Monitor webhook logs** to ensure future emails are processed correctly
