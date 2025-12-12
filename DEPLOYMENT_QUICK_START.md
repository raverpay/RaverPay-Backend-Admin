# ⚡ Deployment Quick Start Guide

Quick reference for deploying RaverPay apps.

## 🚀 Manual Deployment Commands

### Deploy Single App

```bash
# API
cd apps/raverpay-api && railway up

# Admin
cd apps/raverpay-admin && railway up

# Web
cd apps/raverpay-web && railway up
```

### Deploy All Apps

```bash
# From project root
cd apps/raverpay-api && railway up && cd ../..
cd apps/raverpay-admin && railway up && cd ../..
cd apps/raverpay-web && railway up && cd ../..
```

### Deploy to Specific Environment

```bash
# Production
railway up --environment production

# Staging
railway up --environment staging
```

---

## 🤖 Automated Deployment (CI/CD)

### How It Works

**Just push to GitHub!** 🎯

```bash
# Staging deployment
git checkout develop
git push origin develop
# → Automatically deploys API, Admin, Web to staging

# Production deployment
git checkout main
git push origin main
# → Automatically deploys API, Admin, Web to production
```

### What Gets Deployed When

| Branch    | API           | Admin         | Web           |
| --------- | ------------- | ------------- | ------------- |
| `main`    | ✅ Production | ✅ Production | ✅ Production |
| `develop` | ✅ Staging    | ✅ Staging    | ✅ Staging    |

---

## 📋 Prerequisites

1. **Railway CLI installed**:

   ```bash
   npm install -g @railway/cli
   ```

2. **Logged into Railway**:

   ```bash
   railway login
   ```

3. **Projects linked** (one-time):
   ```bash
   cd apps/raverpay-api && railway link
   cd apps/raverpay-admin && railway link
   cd apps/raverpay-web && railway link
   ```

---

## 🔍 Check Deployment Status

```bash
# Check current status
railway status

# View logs
railway logs

# View recent logs
railway logs --tail 100
```

---

## 🆘 Troubleshooting

### Deployment Fails

1. Check Railway logs: `railway logs`
2. Check GitHub Actions: Repository → Actions tab
3. Verify environment variables are set
4. Check build errors in logs

### Need to Rollback

```bash
# Redeploy previous version
railway up --detach
```

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

---

**Quick Tip**: Use CI/CD (automatic deployment) for normal workflow. Use manual deployment only for emergencies or testing.
