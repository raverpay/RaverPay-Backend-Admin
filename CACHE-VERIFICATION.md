# How to Verify Redis Caching is Working

## ✅ Quick Checklist

### 1. Environment Variable is Set
Your `.env` file already has:
```env
REDIS_URL="rediss://default:AXHIAAIncDIxYjkzYTY3Mzg5OGU0MDBlYWE1YzBiYWZjNmI5NzAzMnAyMjkxMjg@select-malamute-29128.upstash.io:6379"
```
✅ **This is correct!** The code now reads this variable.

### 2. Railway Environment Variable
Make sure Railway also has this environment variable:
1. Go to Railway project settings
2. Add environment variable:
   - **Name**: `REDIS_URL`
   - **Value**: `rediss://default:AXHIAAIncDIxYjkzYTY3Mzg5OGU0MDBlYWE1YzBiYWZjNmI5NzAzMnAyMjkxMjg@select-malamute-29128.upstash.io:6379`

---

## 📊 Three Ways to Check Caching is Working

### Method 1: Upstash Dashboard (Easiest)

1. Go to https://console.upstash.com
2. Select your database: `select-malamute-29128`
3. Look at the metrics:

**What to expect:**
- **Commands/sec**: Will spike when API receives requests
- **Daily Requests**: Will increase with each cache operation
- **Storage**: Will show data being cached (in bytes)

**Click "Data Browser":**
- You should see keys like:
  - `wallet:user-id-here`
  - `transactions:user-id-here:page:1:limit:20:...`
  - `transaction:transaction-id-here`

**Real-time activity:**
- Click "Recent Commands" tab
- Make an API request (e.g., GET /api/wallet)
- You'll see Redis commands appear in real-time:
  - `GET wallet:abc123` (first request - cache miss)
  - `SET wallet:abc123` (data cached)
  - `GET wallet:abc123` (second request - cache hit!)

---

### Method 2: Railway Logs

1. Go to Railway project → Deployments
2. Click latest deployment → View Logs
3. After deployment, you should see:
   ```
   ✅ Redis cache enabled with URL: rediss://****@select-malamute-29128.upstash.io:6379
   ```

4. Make API requests, then search logs for:
   - `Cache HIT` - Data retrieved from cache ✅
   - `Cache MISS` - Data fetched from database ❌
   - `Cache SET` - Data stored in cache 💾
   - `Cache DEL` - Cache invalidated 🗑️

**Expected flow for wallet query:**
```
First request:
  ❌ Cache MISS: wallet:user123
  💾 Cache SET: wallet:user123 (TTL: 60s)

Second request (within 60s):
  ✅ Cache HIT: wallet:user123  <-- This is what you want to see!
```

---

### Method 3: API Response Time

Use your mobile app or Postman:

1. **First request** (cold cache):
   ```bash
   GET /api/wallet
   Response time: ~500ms (fetching from database)
   ```

2. **Second request** (warm cache):
   ```bash
   GET /api/wallet
   Response time: ~50ms (fetching from cache) 🚀
   ```

**10x faster!**

---

## 🧪 Testing Scenarios

### Scenario 1: Wallet Balance Cache
1. **Request**: `GET /api/wallet`
2. **Expected logs**:
   - First call: `Cache MISS: wallet:userId` → `Cache SET: wallet:userId (TTL: 60s)`
   - Second call (within 60s): `Cache HIT: wallet:userId`
3. **Upstash dashboard**: Should show 2 GET commands, 1 SET command

### Scenario 2: Transaction Cache Invalidation
1. **Request**: `GET /api/wallet` (cache populated)
2. **Action**: Buy airtime via `POST /api/vtu/airtime`
3. **Expected logs**:
   ```
   Cache DEL: wallet:userId
   Cache DEL PATTERN: transactions:userId:*
   ```
4. **Next request**: `GET /api/wallet` → `Cache MISS` (cache was invalidated)
5. **Upstash dashboard**: DEL commands visible in "Recent Commands"

### Scenario 3: Transaction List Pagination
1. **Request**: `GET /api/wallet/transactions?page=1&limit=20`
2. **Expected logs**:
   - First call: `Cache MISS` → `Cache SET (TTL: 120s)`
   - Second call: `Cache HIT`
3. **Upstash dashboard**: Key visible like `transactions:userId:page:1:limit:20:type:all:...`

---

## 🔍 Troubleshooting

### No cache operations in logs?
**Check Railway environment variable:**
```bash
# In Railway, run this command in the terminal:
echo $REDIS_URL
```
Should output: `rediss://default:AXHIAAIn...@select-malamute-29128.upstash.io:6379`

### Seeing "Using in-memory cache" warning?
**Problem**: Environment variable not found
**Solution**: Add `REDIS_URL` to Railway environment variables and redeploy

### Upstash dashboard shows 0 requests?
**Problem**: API not connected to Redis
**Solutions**:
1. Check Railway logs for Redis connection confirmation
2. Verify environment variable is set correctly
3. Check Upstash database is in "Active" status

---

## 📈 Success Metrics

After caching is working, you should see:

| Metric | Before | After |
|--------|--------|-------|
| Wallet query time | 500ms | 50ms |
| Transaction list time | 800ms | 100ms |
| Transaction details time | 300ms | 30ms |
| Database query count | 100% | ~20% (80% cache hit rate) |
| Upstash requests/day | 0 | 1,000+ |

---

## 🎯 Quick Test Commands

If you want to test locally:

```bash
# Start API
cd apps/mularpay-api
pnpm run start:dev

# Watch logs for cache operations
# Make requests to http://localhost:3000/api/wallet

# First request - you'll see:
# ❌ Cache MISS: wallet:userId
# 💾 Cache SET: wallet:userId (TTL: 60s)

# Second request - you'll see:
# ✅ Cache HIT: wallet:userId
```

---

## Need Help?

If caching isn't working:
1. Check Railway logs for startup message
2. Check Upstash dashboard for connection
3. Verify environment variable is correct
4. Check "Recent Commands" in Upstash for Redis activity
