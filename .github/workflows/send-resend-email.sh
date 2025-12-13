#!/bin/bash
# Send email via Resend API
# Usage: ./send-resend-email.sh <subject> <body> <to_email>

SUBJECT="$1"
BODY="$2"
TO_EMAIL="${3:-raverpay@outlook.com}"
RESEND_API_KEY="${RESEND_API_KEY}"

if [ -z "$RESEND_API_KEY" ]; then
  echo "❌ RESEND_API_KEY environment variable is required"
  exit 1
fi

# Convert body to JSON-safe format (escape newlines and quotes)
BODY_JSON=$(echo "$BODY" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Send email via Resend API
RESPONSE=$(curl -s -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"RaverPay CI/CD <noreply@raverpay.com>\",
    \"to\": [\"$TO_EMAIL\"],
    \"subject\": \"$SUBJECT\",
    \"text\": \"$BODY_JSON\"
  }")

# Check if request was successful
if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ Email sent successfully via Resend"
  exit 0
else
  echo "❌ Failed to send email via Resend"
  echo "Response: $RESPONSE"
  exit 1
fi
    
