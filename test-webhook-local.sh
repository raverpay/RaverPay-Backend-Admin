#!/bin/bash

# MularPay Local Webhook Testing Script
# This helps you test the complete payment flow with ngrok

echo "🚀 MularPay Webhook Testing (Local + ngrok)"
echo "============================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/api > /dev/null 2>&1; then
    echo "❌ Server not running on port 3001"
    echo "Run: cd apps/mularpay-api && pnpm run start:dev"
    exit 1
fi
echo "✅ Server running on port 3001"

# Check if ngrok is running
if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "❌ ngrok not running"
    echo "Run: ngrok http 3001"
    exit 1
fi

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)
if [ -z "$NGROK_URL" ]; then
    echo "❌ Could not get ngrok URL"
    exit 1
fi

echo "✅ ngrok running"
echo ""
echo "📍 Your URLs:"
echo "   Local API: http://localhost:3001/api"
echo "   Public URL: $NGROK_URL"
echo "   Webhook URL: $NGROK_URL/api/payments/webhooks/paystack"
echo "   ngrok Dashboard: http://localhost:4040"
echo ""

# Check if user has token
if [ -z "$ACCESSTOKEN" ]; then
    echo "⚠️  No ACCESSTOKEN environment variable found"
    echo ""
    echo "Get your token by logging in:"
    echo "curl -X POST http://localhost:3001/api/auth/login \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"identifier\": \"your-email@example.com\", \"password\": \"yourpassword\"}'"
    echo ""
    echo "Then run: export ACCESSTOKEN=\"your-token-here\""
    exit 1
fi

echo "✅ Access token found"
echo ""

# Check wallet balance
echo "💰 Current Wallet Balance:"
BALANCE=$(curl -s -X GET http://localhost:3001/api/wallet \
  -H "Authorization: Bearer $ACCESSTOKEN" | python3 -c "import sys, json; print(json.load(sys.stdin)['balance'])" 2>/dev/null)
echo "   ₦$BALANCE"
echo ""

# Initialize payment
echo "💳 Initializing ₦5,000 payment..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/transactions/fund/card \
  -H "Authorization: Bearer $ACCESSTOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}')

AUTH_URL=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('authorizationUrl', ''))" 2>/dev/null)
REFERENCE=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('reference', ''))" 2>/dev/null)

if [ -z "$AUTH_URL" ]; then
    echo "❌ Payment initialization failed"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Payment initialized!"
echo "   Reference: $REFERENCE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open this URL in your browser:"
echo "   $AUTH_URL"
echo ""
echo "2. Enter test card details:"
echo "   Card Number: 4084 0840 8408 4081"
echo "   CVV: 408"
echo "   Expiry: 12/30"
echo "   PIN: 0000"
echo "   OTP: 123456"
echo ""
echo "3. Watch these dashboards:"
echo "   🔍 ngrok requests: http://localhost:4040"
echo "   📊 Server logs: Check your terminal"
echo "   💰 Paystack dashboard: https://dashboard.paystack.com"
echo ""
echo "4. After payment, run this to check balance:"
echo "   curl -X GET http://localhost:3001/api/wallet \\"
echo "     -H \"Authorization: Bearer \$ACCESSTOKEN\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ Waiting for payment completion..."
echo "   (Press Ctrl+C to exit)"
echo ""

# Monitor for 5 minutes
for i in {1..60}; do
    sleep 5
    
    # Check transaction status
    STATUS=$(curl -s -X GET "http://localhost:3001/api/wallet/transactions?reference=$REFERENCE" \
      -H "Authorization: Bearer $ACCESSTOKEN" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data['data']:
        print(data['data'][0]['status'])
    else:
        print('PENDING')
except:
    print('ERROR')
" 2>/dev/null)
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 PAYMENT SUCCESSFUL!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Get updated balance
        NEW_BALANCE=$(curl -s -X GET http://localhost:3001/api/wallet \
          -H "Authorization: Bearer $ACCESSTOKEN" | python3 -c "import sys, json; print(json.load(sys.stdin)['balance'])" 2>/dev/null)
        
        echo "💰 Updated Balance: ₦$NEW_BALANCE"
        echo "📝 Reference: $REFERENCE"
        echo "✅ Webhook processed successfully"
        echo ""
        echo "Check transaction details:"
        echo "curl -X GET http://localhost:3001/api/wallet/transactions \\"
        echo "  -H \"Authorization: Bearer \$ACCESSTOKEN\""
        echo ""
        exit 0
    fi
    
    # Show progress
    echo -n "."
done

echo ""
echo "⏰ Timeout reached. Payment may still be processing."
echo "Check manually:"
echo "curl -X GET http://localhost:3001/api/transactions/verify/$REFERENCE \\"
echo "  -H \"Authorization: Bearer \$ACCESSTOKEN\""

