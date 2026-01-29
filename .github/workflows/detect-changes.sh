#!/bin/bash
# Detect which apps changed in the monorepo
# Uses Turbo for intelligent change detection with git diff as fallback

set -e

# Get the base commit (previous commit on main branch)
BASE_COMMIT="${BASE_COMMIT:-HEAD~1}"
CURRENT_COMMIT="${CURRENT_COMMIT:-HEAD}"

echo "🔍 Detecting changed apps..."
echo "Base commit: $BASE_COMMIT"
echo "Current commit: $CURRENT_COMMIT"
echo ""

# Initialize flags
API_CHANGED=false
ADMIN_CHANGED=false
WEB_CHANGED=false
SHARED_CHANGED=false
ROOT_CHANGED=false

# Check if base commit exists (handles first push)
if ! git rev-parse --verify "$BASE_COMMIT" >/dev/null 2>&1; then
  echo "⚠️ Base commit not found (likely first push) - will build all apps for safety"
  API_CHANGED=true
  ADMIN_CHANGED=true
  WEB_CHANGED=true
  BASE_COMMIT="HEAD"
fi

# Get list of changed files
CHANGED_FILES=$(git diff --name-only $BASE_COMMIT..$CURRENT_COMMIT 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo "⚠️ No changes detected (might be first commit)"
  echo "api_changed=false" >> $GITHUB_OUTPUT
  echo "admin_changed=false" >> $GITHUB_OUTPUT
  echo "web_changed=false" >> $GITHUB_OUTPUT
  echo "shared_changed=false" >> $GITHUB_OUTPUT
  echo "root_changed=false" >> $GITHUB_OUTPUT
  exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES" | head -20
echo ""

# Check for changes in each app directory
if echo "$CHANGED_FILES" | grep -q "^apps/raverpay-api/"; then
  API_CHANGED=true
  echo "✅ API changed"
fi

if echo "$CHANGED_FILES" | grep -q "^apps/raverpay-admin/"; then
  ADMIN_CHANGED=true
  echo "✅ Admin changed"
fi

# Web app builds are disabled in CI/CD

if echo "$CHANGED_FILES" | grep -q "^packages/shared/"; then
  SHARED_CHANGED=true
  echo "✅ Shared package changed"
fi

# Check for root-level changes (config files, etc.)
if echo "$CHANGED_FILES" | grep -qE "^(package\.json|pnpm-lock\.yaml|turbo\.json|\.github/|\.env|\.env\.example)"; then
  ROOT_CHANGED=true
  echo "✅ Root/config files changed"
fi

# If shared package changed, mark all apps as changed (safety)
if [ "$SHARED_CHANGED" = true ]; then
  echo "⚠️ Shared package changed - will build API/Admin for safety"
  API_CHANGED=true
  ADMIN_CHANGED=true
fi

# If root config changed, mark all apps as changed (safety)
if [ "$ROOT_CHANGED" = true ]; then
  echo "⚠️ Root config changed - will build API/Admin for safety"
  API_CHANGED=true
  ADMIN_CHANGED=true
fi

# Check if only documentation/config files changed
DOCS_ONLY=true
if echo "$CHANGED_FILES" | grep -qvE "\.(md|txt|yml|yaml|json)$|^\.github/|^docs/|^md/"; then
  DOCS_ONLY=false
fi

# Output results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Change Detection Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API changed:    $API_CHANGED"
echo "Admin changed:  $ADMIN_CHANGED"
echo "Web changed:    $WEB_CHANGED"
echo "Shared changed: $SHARED_CHANGED"
echo "Root changed:   $ROOT_CHANGED"
echo "Docs only:      $DOCS_ONLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set GitHub Actions outputs
echo "api_changed=$API_CHANGED" >> $GITHUB_OUTPUT
echo "admin_changed=$ADMIN_CHANGED" >> $GITHUB_OUTPUT
echo "web_changed=$WEB_CHANGED" >> $GITHUB_OUTPUT
echo "shared_changed=$SHARED_CHANGED" >> $GITHUB_OUTPUT
echo "root_changed=$ROOT_CHANGED" >> $GITHUB_OUTPUT
echo "docs_only=$DOCS_ONLY" >> $GITHUB_OUTPUT

# If only docs changed, skip build/deploy
if [ "$DOCS_ONLY" = true ] && [ "$API_CHANGED" = false ] && [ "$ADMIN_CHANGED" = false ] && [ "$WEB_CHANGED" = false ]; then
  echo "📝 Only documentation/config files changed - skipping build/deploy"
  echo "skip_build=true" >> $GITHUB_OUTPUT
else
  echo "skip_build=false" >> $GITHUB_OUTPUT
fi

