#!/bin/bash

# Diagnostic script to test Better Stack/Logtail integration

echo "=== Better Stack / Logtail Diagnostic ==="
echo ""

# Test 1: Check if LOGTAIL_SOURCE_TOKEN is set
echo "1. Checking environment variable..."
if grep -q "LOGTAIL_SOURCE_TOKEN" apps/raverpay-api/.env 2>/dev/null; then
    echo "   ✅ LOGTAIL_SOURCE_TOKEN found in .env file"
    # Don't print the actual value for security
else
    echo "   ❌ LOGTAIL_SOURCE_TOKEN NOT found in .env file"
    echo "   → You need to add: LOGTAIL_SOURCE_TOKEN=8q3WwqFjeC1ghtTFJcgjhefz"
fi
echo ""

# Test 2: Test direct connection to Better Stack
echo "2. Testing direct connection to Better Stack..."
RESPONSE=$(curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer 8q3WwqFjeC1ghtTFJcgjhefz' \
  -d '{"dt":"'"$(date -u +'%Y-%m-%d %T UTC')"'","message":"Diagnostic test from script"}' \
  --insecure \
  -s -w "\nHTTP_CODE:%{http_code}" \
  https://s1641618.eu-nbg-2.betterstackdata.com)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "202" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "   ✅ Direct connection successful (HTTP $HTTP_CODE)"
    echo "   → Check Better Stack dashboard: https://telemetry.betterstack.com/team/t486268/tail?s=1641618"
else
    echo "   ❌ Connection failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 3: Check if @logtail/node package is installed
echo "3. Checking if @logtail/node package is installed..."
if [ -d "node_modules/@logtail" ]; then
    echo "   ✅ @logtail/node package is installed"
    LOGTAIL_VERSION=$(cat node_modules/@logtail/node/package.json | grep '"version"' | head -1 | cut -d'"' -f4)
    echo "   → Version: $LOGTAIL_VERSION"
else
    echo "   ❌ @logtail/node package NOT installed"
    echo "   → Run: npm install @logtail/node"
fi
echo ""

echo "=== Recommendations ==="
echo ""
echo "1. Ensure LOGTAIL_SOURCE_TOKEN=8q3WwqFjeC1ghtTFJcgjhefz is in your .env file"
echo "2. Restart your server after adding the token"
echo "3. Check server logs for: '✅ Logtail initialized'"
echo "4. If you see 'LOGTAIL_SOURCE_TOKEN not configured', the token is missing"
echo ""
echo "=== Next Steps ==="
echo "After setting the token and restarting:"
echo "1. Make an API request (e.g., GET /api/wallet)"
echo "2. Check Better Stack dashboard within 5-10 seconds"
echo "3. Look for logs with context: 'HTTP Request Completed'"
