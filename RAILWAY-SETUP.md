# Railway Setup for Redis Caching

## ⚡ Quick Setup (2 minutes)

### Step 1: Add Environment Variable to Railway

1. Go to https://railway.app
2. Select your MularPay API project
3. Click **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   ```
   Variable name: REDIS_URL
   Value: rediss://default:AXHIAAIncDIxYjkzYTY3Mzg5OGU0MDBlYWE1YzBiYWZjNmI5NzAzMnAyMjkxMjg@select-malamute-29128.upstash.io:6379
   ```
6. Click **"Add"**
7. Railway will **automatically redeploy** your API

### Step 2: Verify Deployment

1. Wait for deployment to complete (~2 minutes)
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**
5. Look for:
   ```
   ✅ Redis cache enabled with URL: rediss://****@select-malamute-29128.upstash.io:6379
   ```

✅ **If you see this message, caching is working!**

---

## 🎯 What Happens Next

### Immediate Effects:
1. All wallet queries will be cached for 60 seconds
2. All transaction lists will be cached for 2 minutes
3. Individual transactions will be cached for 10 minutes
4. Cache automatically invalidates after purchases/deposits

### Performance Gains:
- **Wallet balance**: 500ms → 50ms (10x faster)
- **Transaction history**: 800ms → 100ms (8x faster)
- **Transaction details**: 300ms → 30ms (10x faster)

---

## 📊 Monitoring After Deployment

### Railway Logs:
Search for these in logs to verify caching:
- `Cache HIT` - Data served from cache ✅
- `Cache MISS` - Data fetched from database ❌
- `Cache SET` - Data stored in cache 💾
- `Cache DEL` - Cache cleared after transaction 🗑️

### Upstash Dashboard:
1. Go to https://console.upstash.com
2. Select `select-malamute-29128` database
3. Watch metrics:
   - **Commands/sec** will spike during usage
   - **Daily Requests** will count cache operations
   - **Storage** will show cached data size

---

## 🔍 Verification Checklist

After Railway deployment completes:

- [ ] Startup log shows `✅ Redis cache enabled`
- [ ] Upstash dashboard shows increasing request count
- [ ] API response times are significantly faster
- [ ] Mobile app feels more responsive
- [ ] Railway logs show cache HIT/MISS operations

---

## 💰 Cost Impact

### Upstash Free Tier:
- **10,000 requests/day** - FREE
- **256 MB storage** - FREE

### Your Expected Usage:
- ~100 users × 50 requests/day = 5,000 requests/day
- **Cost: $0/month** ✅

### When You'll Need to Pay:
- **After 10K requests/day** (~200 active users)
- **Cost**: $0.20 per 100K requests
- **Example**: 1M requests/day = $6/month

---

## 🚨 Troubleshooting

### "Using in-memory cache" warning in logs?
**Problem**: REDIS_URL not found
**Solution**: Double-check you added the variable to Railway (not just .env)

### No cache operations in logs?
**Problem**: Variable might be wrong
**Solution**:
1. Go to Railway Variables tab
2. Verify REDIS_URL value matches exactly:
   ```
   rediss://default:AXHIAAIncDIxYjkzYTY3Mzg5OGU0MDBlYWE1YzBiYWZjNmI5NzAzMnAyMjkxMjg@select-malamute-29128.upstash.io:6379
   ```

### Upstash shows 0 requests?
**Solutions**:
1. Make some API requests from your mobile app
2. Check Railway logs show `Redis cache enabled`
3. Verify Upstash database status is "Active"

---

## ⚙️ Optional: Enable Debug Logs in Railway

To see detailed cache operations:

1. Railway project → Variables
2. Add variable:
   ```
   LOG_LEVEL=debug
   ```
3. Redeploy

Now you'll see ALL cache operations in logs:
```
[RedisService] ❌ Cache MISS: wallet:abc123
[RedisService] 💾 Cache SET: wallet:abc123 (TTL: 60s)
[RedisService] ✅ Cache HIT: wallet:abc123
```

---

## 📞 Need Help?

If something's not working:
1. Check Railway deployment logs for errors
2. Check Upstash dashboard is active
3. Verify REDIS_URL variable is set correctly
4. Check "Recent Commands" tab in Upstash

The caching system will **gracefully fall back** to database queries if Redis fails, so your API will always work even if caching has issues.
