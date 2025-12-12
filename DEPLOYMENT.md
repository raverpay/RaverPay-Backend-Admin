# 🚀 RaverPay Deployment Guide

This guide covers manual and automated deployment for all RaverPay applications.

## 📋 Table of Contents

1. [Understanding CI/CD](#understanding-cicd)
2. [Current Deployment Setup](#current-deployment-setup)
3. [Manual Deployment](#manual-deployment)
4. [Automated Deployment (CI/CD)](#automated-deployment-cicd)
5. [Migration from Vercel to Railway](#migration-from-vercel-to-railway)

---

## 🔄 Understanding CI/CD

### What is CI/CD?

**CI/CD** stands for **Continuous Integration** and **Continuous Deployment**:

- **CI (Continuous Integration)**: Automatically runs tests, linting, and builds when you push code to GitHub
- **CD (Continuous Deployment)**: Automatically deploys your code to production/staging when CI passes

### Why Use CI/CD?

✅ **Automation**: No manual deployment steps  
✅ **Consistency**: Same deployment process every time  
✅ **Safety**: Tests run before deployment  
✅ **Speed**: Deploy immediately after pushing code  
✅ **History**: Track all deployments in GitHub Actions

### How It Works with GitHub Actions

1. You push code to GitHub (e.g., `git push origin main`)
2. GitHub Actions detects the push
3. Workflow file (`.github/workflows/*.yml`) runs automatically
4. Code is tested, built, and deployed
5. You get notified of success/failure

**Yes, automatic deployment on push is normal and recommended!** 🎯

---

## 🏗️ Current Deployment Setup

### Current Status

| App       | Platform | Auto-Deploy           | Branch                                   |
| --------- | -------- | --------------------- | ---------------------------------------- |
| **API**   | Railway  | ✅ Yes                | `main` (production), `develop` (staging) |
| **Admin** | Railway  | ⚠️ Vercel (migrating) | `main`, `develop`                        |
| **Web**   | Railway  | ⚠️ Vercel (migrating) | `main`, `develop`                        |

### Deployment Flow

```
┌─────────────┐
│ Push to Git │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ GitHub Actions   │
│ (CI/CD Workflow) │
└──────┬───────────┘
       │
       ├───► API ──────► Railway (Production/Staging)
       ├───► Admin ─────► Railway (Production/Staging)
       └───► Web ───────► Railway (Production/Staging)
```

---

## 🛠️ Manual Deployment

### Prerequisites

1. **Install Railway CLI**:

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:

   ```bash
   railway login
   ```

3. **Link to your project** (one-time setup):

   ```bash
   # For API
   cd apps/raverpay-api
   railway link

   # For Admin
   cd apps/raverpay-admin
   railway link

   # For Web
   cd apps/raverpay-web
   railway link
   ```

### Deploy API

```bash
# Navigate to API directory
cd apps/raverpay-api

# Deploy to Railway
railway up

# Or deploy to specific environment
railway up --environment production
railway up --environment staging
```

### Deploy Admin

```bash
# Navigate to Admin directory
cd apps/raverpay-admin

# Deploy to Railway
railway up

# Or deploy to specific environment
railway up --environment production
railway up --environment staging
```

### Deploy Web

```bash
# Navigate to Web directory
cd apps/raverpay-web

# Deploy to Railway
railway up

# Or deploy to specific environment
railway up --environment production
railway up --environment staging
```

### Deploy All Apps (Single Command)

Create a script in the root `package.json`:

```bash
# From project root
pnpm deploy:all

# Or manually:
cd apps/raverpay-api && railway up && cd ../..
cd apps/raverpay-admin && railway up && cd ../..
cd apps/raverpay-web && railway up && cd ../..
```

---

## 🤖 Automated Deployment (CI/CD)

### How It Currently Works

When you push to GitHub:

1. **API**: Automatically deploys to Railway (production on `main`, staging on `develop`)
2. **Admin**: Currently deploys to Vercel (will be migrated to Railway)
3. **Web**: Currently deploys to Vercel (will be migrated to Railway)

### Workflow Files

- `.github/workflows/deploy-api-production.yml` - API production deployment
- `.github/workflows/deploy-api-staging.yml` - API staging deployment
- `.github/workflows/deploy-web.yml` - Web & Admin deployment (Vercel)
- `.github/workflows/ci.yml` - CI (tests, linting)

### What Happens on Push

**Push to `main` branch:**

- ✅ API → Railway Production
- ✅ Admin → Railway Production (after migration)
- ✅ Web → Railway Production (after migration)

**Push to `develop` branch:**

- ✅ API → Railway Staging
- ✅ Admin → Railway Staging (after migration)
- ✅ Web → Railway Staging (after migration)

### Viewing Deployments

1. Go to your GitHub repository
2. Click **Actions** tab
3. See all workflow runs and their status
4. Click on a run to see detailed logs

---

## 🔄 Migration from Vercel to Railway

### Step-by-Step Migration Plan

#### Step 1: Set Up Railway Services

1. **Create Railway Services** (if not already created):
   - Go to [Railway Dashboard](https://railway.app)
   - Create new services:
     - `raverpay-admin-production`
     - `raverpay-admin-staging`
     - `raverpay-web-production`
     - `raverpay-web-staging`

2. **Get Railway Tokens**:
   - Go to Railway → Settings → Tokens
   - Create tokens for production and staging
   - Add to GitHub Secrets:
     - `RAILWAY_TOKEN_PRODUCTION`
     - `RAILWAY_TOKEN_STAGING`

#### Step 2: Create Railway Configuration Files

✅ **Already Created:**

- `apps/raverpay-admin/railway.json` ✅

⏳ **Need to Create:**

- `apps/raverpay-web/railway.json` (will be created)

#### Step 3: Update GitHub Workflows

✅ **Already Updated:**

- API workflows are already using Railway ✅

⏳ **Need to Update:**

- `.github/workflows/deploy-web.yml` (will be updated to use Railway)

#### Step 4: Test Deployment

1. Push to `develop` branch (staging)
2. Verify deployment works
3. Push to `main` branch (production)
4. Verify production deployment

#### Step 5: Remove Vercel (Optional)

Once Railway deployments are stable:

- Remove Vercel project connections
- Remove Vercel secrets from GitHub
- Update documentation

---

## 📝 Normal Deployment Process

### Daily Development Workflow

1. **Make changes locally**

   ```bash
   git checkout -b feature/my-feature
   # Make your changes
   git add .
   git commit -m "Add new feature"
   ```

2. **Push to GitHub**

   ```bash
   git push origin feature/my-feature
   ```

3. **Create Pull Request** (optional, recommended)
   - GitHub Actions runs CI (tests, linting)
   - Review code
   - Merge to `develop` or `main`

4. **Automatic Deployment**
   - Push to `develop` → Deploys to staging
   - Push to `main` → Deploys to production
   - No manual steps needed! 🎉

### Emergency Manual Deployment

If you need to deploy immediately without pushing:

```bash
# API
cd apps/raverpay-api && railway up

# Admin
cd apps/raverpay-admin && railway up

# Web
cd apps/raverpay-web && railway up
```

---

## 🔍 Monitoring Deployments

### Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. View:
   - Deployment status
   - Build logs
   - Application logs
   - Environment variables
   - Metrics

### GitHub Actions

1. Go to your repository → **Actions** tab
2. View:
   - Workflow runs
   - Build logs
   - Deployment status
   - Error messages

### Check Deployment Status

```bash
# Check Railway status
railway status

# View logs
railway logs

# View recent deployments
railway logs --tail 100
```

---

## 🚨 Troubleshooting

### Deployment Fails

1. **Check GitHub Actions logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review error messages

2. **Check Railway logs**

   ```bash
   railway logs --tail 100
   ```

3. **Common Issues**:
   - Missing environment variables
   - Build errors
   - Database connection issues
   - Missing dependencies

### Manual Rollback

```bash
# View deployment history
railway status

# Redeploy previous version
railway up --detach
```

---

## ✅ Best Practices

1. **Always test locally first**

   ```bash
   pnpm dev:api
   pnpm dev:admin
   pnpm dev:web
   ```

2. **Use branches for features**
   - `main` = production
   - `develop` = staging
   - `feature/*` = new features

3. **Review CI/CD logs**
   - Check GitHub Actions before merging
   - Fix issues before deploying

4. **Monitor deployments**
   - Check Railway dashboard after deployment
   - Verify app is running correctly

5. **Keep secrets secure**
   - Never commit `.env` files
   - Use GitHub Secrets for sensitive data
   - Rotate tokens regularly

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)

---

## 🎯 Quick Reference

### Deploy Single App

```bash
cd apps/[app-name] && railway up
```

### Deploy All Apps

```bash
cd apps/raverpay-api && railway up && cd ../..
cd apps/raverpay-admin && railway up && cd ../..
cd apps/raverpay-web && railway up && cd ../..
```

### Check Status

```bash
railway status
railway logs
```

### View GitHub Actions

- Repository → Actions tab

---

**Last Updated**: $(date)  
**Maintained by**: RaverPay Team
