# 🔄 CI/CD Migration Plan: Vercel → Railway

## 📋 Overview

This document outlines the step-by-step plan to migrate Web and Admin apps from Vercel to Railway, matching the existing API deployment setup.

---

## ✅ What's Already Done

- ✅ API deploys to Railway (production & staging)
- ✅ Admin `railway.json` created
- ✅ Web `railway.json` created
- ✅ New GitHub workflows created for Railway deployment

---

## 🎯 Migration Steps

### Step 1: Set Up Railway Services (Required)

**Action Required**: Create services in Railway dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Navigate to your project
3. Create the following services:
   - `raverpay-web-production`
   - `raverpay-web-staging`
   - `raverpay-admin-production`
   - `raverpay-admin-staging`

**How to create:**

- Click "New Service"
- Select "GitHub Repo" or "Empty Service"
- Name it exactly as above
- Link to your repository

---

### Step 2: Configure Railway Services

For each service:

1. **Set Root Directory**:
   - Web: `apps/raverpay-web`
   - Admin: `apps/raverpay-admin`

2. **Set Build Command** (if not using railway.json):
   - Web: `pnpm install --no-frozen-lockfile --filter @raverpay/raverpay-web && pnpm --filter @raverpay/raverpay-web build`
   - Admin: `pnpm install --no-frozen-lockfile --filter @raverpay/raverpay-admin && pnpm --filter @raverpay/raverpay-admin build`

3. **Set Start Command**:
   - Web: `pnpm --filter @raverpay/raverpay-web start`
   - Admin: `pnpm --filter @raverpay/raverpay-admin start`

4. **Set Environment Variables**:
   - Copy from Vercel (if any)
   - Add any required variables for Railway

---

### Step 3: Verify GitHub Secrets

**Action Required**: Ensure Railway tokens exist in GitHub Secrets

1. Go to GitHub → Your Repository → Settings → Secrets and variables → Actions
2. Verify these secrets exist:
   - ✅ `RAILWAY_TOKEN_PRODUCTION` (should already exist for API)
   - ✅ `RAILWAY_TOKEN_STAGING` (should already exist for API)

**If missing:**

- Go to Railway → Settings → Tokens
- Create new token
- Add to GitHub Secrets

---

### Step 4: Test Staging Deployment

**Action Required**: Test deployment to staging first

1. Push to `develop` branch:

   ```bash
   git checkout develop
   git push origin develop
   ```

2. Check GitHub Actions:
   - Go to Actions tab
   - Verify `Deploy Web & Admin to Railway (Staging)` runs
   - Check for errors

3. Verify in Railway:
   - Check Railway dashboard
   - Verify services are deployed
   - Test staging URLs

---

### Step 5: Test Production Deployment

**Action Required**: Test production deployment

1. Push to `main` branch:

   ```bash
   git checkout main
   git push origin main
   ```

2. Check GitHub Actions:
   - Go to Actions tab
   - Verify `Deploy Web & Admin to Railway (Production)` runs
   - Check for errors

3. Verify in Railway:
   - Check Railway dashboard
   - Verify services are deployed
   - Test production URLs

---

### Step 6: Disable Old Vercel Workflow (Optional)

**Action Required**: Disable or remove old Vercel workflow

**Option A: Disable (Recommended initially)**

- Rename `.github/workflows/deploy-web.yml` to `.github/workflows/deploy-web.yml.disabled`
- Keep for reference

**Option B: Delete**

- Delete `.github/workflows/deploy-web.yml`
- Only do this after confirming Railway deployments work

---

### Step 7: Update Documentation

**Action Required**: Update any documentation referencing Vercel

- ✅ `DEPLOYMENT.md` - Already updated
- Update any other docs mentioning Vercel
- Update README if needed

---

## 🔍 Verification Checklist

Before considering migration complete:

- [ ] All 4 Railway services created (`web-production`, `web-staging`, `admin-production`, `admin-staging`)
- [ ] GitHub secrets configured (`RAILWAY_TOKEN_PRODUCTION`, `RAILWAY_TOKEN_STAGING`)
- [ ] Staging deployment tested and working
- [ ] Production deployment tested and working
- [ ] URLs verified and accessible
- [ ] Environment variables configured in Railway
- [ ] Old Vercel workflow disabled/removed
- [ ] Documentation updated

---

## 🚨 Rollback Plan

If something goes wrong:

1. **Immediate Rollback**:
   - Re-enable old Vercel workflow (rename back)
   - Push to trigger Vercel deployment

2. **Fix Issues**:
   - Check Railway logs
   - Check GitHub Actions logs
   - Fix configuration issues

3. **Retry Migration**:
   - Follow steps again after fixes

---

## 📊 Current vs New Setup

### Before (Vercel)

```
Push to GitHub
  └─> GitHub Actions
      └─> Deploy to Vercel (Web & Admin)
```

### After (Railway)

```
Push to GitHub
  └─> GitHub Actions
      ├─> Deploy API to Railway ✅ (already working)
      ├─> Deploy Web to Railway ⏳ (new)
      └─> Deploy Admin to Railway ⏳ (new)
```

---

## 🎯 Benefits of Migration

✅ **Unified Platform**: All apps on Railway  
✅ **Consistent Deployment**: Same process for all apps  
✅ **Easier Management**: One dashboard for everything  
✅ **Cost Optimization**: Potentially better pricing  
✅ **Simplified Workflows**: Fewer platforms to manage

---

## 📝 Next Steps

1. **Create Railway services** (Step 1) ⏳
2. **Configure services** (Step 2) ⏳
3. **Test staging** (Step 4) ⏳
4. **Test production** (Step 5) ⏳
5. **Disable Vercel** (Step 6) ⏳

---

## ❓ FAQ

**Q: Do I need to delete Vercel projects?**  
A: Not immediately. Keep them until Railway deployments are stable.

**Q: Will there be downtime?**  
A: No, if you test staging first and ensure production works before disabling Vercel.

**Q: Can I keep both Vercel and Railway?**  
A: Yes, but you'll need to manage both. Not recommended long-term.

**Q: What if Railway deployment fails?**  
A: Check logs, fix issues, and retry. Vercel workflow is still available as backup.

---

**Last Updated**: $(date)  
**Status**: Ready to execute
