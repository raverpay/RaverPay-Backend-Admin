# 🚀 RaverPay Deployment Guide

## Quick Reference

- **Direct to Main:** Fast deployment (use for small fixes)
- **Via Pull Request:** Safe deployment (use for features)

---

## Method 1: Deploy Directly to Main

**When to use:** Small fixes, urgent hotfixes, documentation updates

### Step 1: Make your changes

```bash
# Edit your files as needed
```

### Step 2: Run local checks (optional but recommended)

```bash
cd /Users/joseph/Desktop/raverpay

pnpm format        # Auto-fix formatting
pnpm lint          # Check for errors
pnpm typecheck     # Check TypeScript
pnpm test          # Run tests
```

### Step 3: Commit your changes

```bash
git add .
git commit -m "fix: your descriptive commit message"
```

### Step 4: Push to main

```bash
git push origin main
```

### Step 5: Monitor deployment

1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. Watch the workflow run (~15 minutes)
3. Check your email for deployment notification

**Done!** ✅ Your changes are live once all checks pass.

---

## Method 2: Deploy via Pull Request (Recommended)

**When to use:** New features, major changes, when you want review

### Step 1: Create a feature branch

```bash
cd /Users/joseph/Desktop/raverpay

git checkout -b feature/your-feature-name
# Example: git checkout -b feature/add-payment-method
```

### Step 2: Make your changes

```bash
# Edit your files as needed
```

### Step 3: Run local checks

```bash
pnpm format        # Auto-fix formatting
pnpm lint          # Check for errors
pnpm typecheck     # Check TypeScript
pnpm test          # Run tests
```

### Step 4: Commit your changes

```bash
git add .
git commit -m "feat: descriptive message about what you added"
```

### Step 5: Push your branch

```bash
git push origin feature/your-feature-name
```

### Step 6: Create Pull Request

1. Go to your GitHub repository
2. Click "Compare & pull request" button
3. Add title: `feat: Your Feature Name`
4. Add description of changes
5. Click "Create pull request"

### Step 7: Wait for CI checks

- GitHub Actions will run automatically
- All checks must pass (format, lint, test, build, security)
- Review the results in the PR

### Step 8: Merge the Pull Request

**Option A: If checks pass**

1. Click "Merge pull request"
2. Click "Confirm merge"
3. Delete the branch (optional)

**Option B: If checks fail**

1. Review the error logs
2. Fix issues locally
3. Commit and push again
4. Checks will re-run automatically

### Step 9: Deployment starts automatically

- Once merged, deployment to Railway begins
- Monitor at: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- Check email for deployment status

**Done!** ✅ Your changes are live.

---

## Commit Message Format

Use these prefixes:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**

```bash
git commit -m "feat: add stripe payment integration"
git commit -m "fix: resolve wallet balance calculation error"
git commit -m "docs: update API documentation"
```

---

## What Happens During Deployment?

### Automatic Checks (Both Methods)

```
1. Format Check (~1 min)
   ├─ Prettier validation
   └─ Code style consistency

2. Lint (~2 min)
   ├─ ESLint rules
   └─ Code quality checks

3. Type Check (~2 min)
   ├─ TypeScript validation
   └─ Type safety verification

4. Tests (~3 min)
   ├─ Unit tests
   └─ Test coverage

5. Build (~5 min)
   ├─ raverpay-api
   ├─ raverpay-admin
   └─ raverpay-web

6. Security Scan (~2 min)
   ├─ Dependency vulnerabilities
   └─ Secret detection

7. Deploy to Railway (~3 min) [main only]
   ├─ Build and deploy
   └─ Health check

8. Email Notification
   └─ Success/failure email
```

**Total Time:** ~15 minutes for main deployment

---

## Troubleshooting

### If Deployment Fails

**Step 1:** Check the error in GitHub Actions logs

**Step 2:** Run checks locally to reproduce:

```bash
pnpm format:check  # Find formatting issues
pnpm lint          # Find linting errors
pnpm typecheck     # Find type errors
pnpm test          # Find failing tests
pnpm build         # Find build errors
```

**Step 3:** Fix the issue

**Step 4:** Commit and push again

```bash
git add .
git commit -m "fix: resolve CI/CD issue"
git push origin main
# or
git push origin your-branch-name
```

---

## Best Practices

### ✅ Do

- Run local checks before pushing
- Write descriptive commit messages
- Use PRs for significant changes
- Monitor deployment status
- Keep commits focused and small

### ❌ Don't

- Push directly to main for large features
- Skip local testing
- Ignore CI/CD warnings
- Force push to main
- Commit without testing locally

---

## Quick Commands Cheat Sheet

```bash
# Check current branch
git branch

# Create new branch
git checkout -b feature/name

# Stage all changes
git add .

# Commit changes
git commit -m "type: message"

# Push to current branch
git push origin $(git branch --show-current)

# Switch to main
git checkout main

# Update from remote
git pull origin main

# Run all local checks
pnpm format && pnpm lint && pnpm typecheck && pnpm test

# Build locally
pnpm build
```

---

## Example Workflow

### Scenario: Adding a new payment method

```bash
# 1. Create feature branch
git checkout -b feature/add-mpesa-payment

# 2. Make changes (edit files)

# 3. Test locally
pnpm test

# 4. Format code
pnpm format

# 5. Commit
git add .
git commit -m "feat: add M-Pesa payment integration"

# 6. Push branch
git push origin feature/add-mpesa-payment

# 7. Create PR on GitHub
# 8. Wait for checks to pass
# 9. Merge PR
# 10. Automatic deployment starts
```

---

## Contact & Support

- **CI/CD Issues:** Check GitHub Actions logs
- **Deployment Failed:** Check Railway logs
- **Email Notifications:** raverpay@outlook.com

---

**Remember:** The CI/CD pipeline is your safety net. If it fails, it's protecting you from deploying broken code! 🛡️
