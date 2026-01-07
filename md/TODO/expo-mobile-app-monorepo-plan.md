# Expo Mobile App Integration Plan for RaverPay Monorepo

**Created:** January 7, 2026  
**Status:** Planning  
**Goal:** Successfully integrate an Expo React Native mobile app into the existing pnpm monorepo

---

## Table of Contents

1. [Problem Analysis](#problem-analysis)
2. [Root Cause](#root-cause)
3. [Solution Overview](#solution-overview)
4. [Step-by-Step Implementation Plan](#step-by-step-implementation-plan)
5. [Phase 1: Basic Expo Setup](#phase-1-basic-expo-setup)
6. [Phase 2: Install Full Dependencies](#phase-2-install-full-dependencies)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Verification Checklist](#verification-checklist)

---

## Problem Analysis

### Current Monorepo Structure

```
raverpay/
├── apps/
│   ├── raverpay-admin/     # Next.js admin dashboard
│   └── raverpay-api/       # NestJS API
├── packages/
│   ├── config/             # Shared configuration
│   └── shared/             # Shared utilities
├── package.json            # Root package (workspaces defined)
├── pnpm-workspace.yaml     # pnpm workspace config
├── turbo.json              # Turborepo config
└── (NO .npmrc file!)       # ← This is the issue!
```

### The Issue You Experienced

When adding an Expo app to the monorepo, **pnpm gets stuck** during package installation. This happens because:

1. **pnpm's Default Behavior**: pnpm uses a strict, symlinked `node_modules` structure by default (isolated dependencies)
2. **React Native/Expo Requirements**: Metro bundler and React Native expect a flattened `node_modules` structure
3. **Without hoisting**: React Native packages can't find their peer dependencies, causing infinite resolution loops or hangs

---

## Root Cause

The root cause is that pnpm's default isolation mode conflicts with how:

- **Metro** (React Native bundler) resolves modules
- **React Native** native modules expect to find dependencies
- **Expo** prebuild and EAS build systems work

---

## Solution Overview

### The Key Fix: `.npmrc` Configuration

We need to tell pnpm to use a **hoisted node_modules structure** instead of its default strict isolation. This is the **officially recommended solution** by both Expo and the community.

Create a `.npmrc` file at the root of the monorepo with:

```ini
node-linker=hoisted
```

### Additional Configurations

1. **Update pnpm-workspace.yaml** (if needed)
2. **Configure Metro for monorepo** (metro.config.js)
3. **Update turbo.json** for mobile dev commands
4. **Add Expo-specific package configurations**

---

## Step-by-Step Implementation Plan

### Prerequisites Checklist

- [ ] Ensure pnpm version >= 8.0.0 (current: 8.15.0 ✓)
- [ ] Ensure Node.js >= 18.0.0 ✓
- [ ] Have Expo CLI available (`npx expo --version`)

---

## Phase 1: Basic Expo Setup

### Step 1.1: Create `.npmrc` File (CRITICAL)

```bash
# From monorepo root
echo "node-linker=hoisted" > .npmrc
```

**Full `.npmrc` content:**

```ini
# Enable hoisted node_modules for React Native/Expo compatibility
node-linker=hoisted

# Optional: Increase network timeout for large installs
fetch-timeout=120000

# Optional: Show detailed progress during install
reporter=default

# Optional: Auto-install peer dependencies
auto-install-peers=true
```

### Step 1.2: Clean Existing node_modules

Before adding the new app, clean up to ensure the new configuration takes effect:

```bash
# From monorepo root
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm pnpm-lock.yaml
```

### Step 1.3: Create the Expo App

```bash
# From monorepo root
pnpm create expo-app apps/raverpay-mobile --template blank-typescript
```

**Alternative (if above has issues):**

```bash
# Create the directory first
mkdir -p apps/raverpay-mobile

# Navigate and create
cd apps/raverpay-mobile
npx create-expo-app@latest . --template blank-typescript
```

### Step 1.4: Update Mobile App's package.json

After creation, update `apps/raverpay-mobile/package.json`:

```json
{
  "name": "@raverpay/raverpay-mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "dev": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  }
}
```

**Important**: The `name` must follow the `@raverpay/*` pattern to match other apps in the monorepo.

### Step 1.5: Install Dependencies

```bash
# From monorepo root
pnpm install
```

This should now work without hanging!

### Step 1.6: Configure Metro for Monorepo

Create/update `apps/raverpay-mobile/metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup (for pnpm compatibility)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

### Step 1.7: Update Root package.json

Add mobile-specific scripts to the root `package.json`:

```json
{
  "scripts": {
    "dev:mobile": "turbo run dev --filter=@raverpay/raverpay-mobile",
    "start:mobile": "pnpm --filter @raverpay/raverpay-mobile start",
    "ios": "pnpm --filter @raverpay/raverpay-mobile ios",
    "android": "pnpm --filter @raverpay/raverpay-mobile android",
    "mobile:prebuild": "pnpm --filter @raverpay/raverpay-mobile prebuild"
  }
}
```

### Step 1.8: Verify Basic Installation

```bash
# Start the app
cd apps/raverpay-mobile
pnpm start
```

If this works, the basic Expo installation is successful!

---

## Phase 2: Install Full Dependencies

Once Phase 1 is verified, install the full list of dependencies.

### Step 2.1: Install Production Dependencies

```bash
cd apps/raverpay-mobile

pnpm add \
  @expo-google-fonts/urbanist \
  @expo/vector-icons \
  @hookform/resolvers \
  @react-native-async-storage/async-storage \
  @react-native-community/datetimepicker \
  @react-native-community/netinfo \
  @react-navigation/bottom-tabs \
  @react-navigation/elements \
  @react-navigation/native \
  @sentry/react-native \
  @shopify/flash-list \
  @tanstack/query-async-storage-persister \
  @tanstack/react-query \
  axios \
  date-fns \
  expo-application \
  expo-blur \
  expo-clipboard \
  expo-constants \
  expo-contacts \
  expo-crypto \
  expo-dev-client \
  expo-device \
  expo-file-system \
  expo-font \
  expo-haptics \
  expo-image \
  expo-image-picker \
  expo-linear-gradient \
  expo-linking \
  expo-local-authentication \
  expo-notifications \
  expo-print \
  expo-router \
  expo-secure-store \
  expo-sharing \
  expo-splash-screen \
  expo-status-bar \
  expo-store-review \
  expo-symbols \
  expo-system-ui \
  expo-updates \
  expo-web-browser \
  nativewind \
  react-hook-form \
  react-native-css-interop \
  react-native-gesture-handler \
  react-native-qrcode-svg \
  react-native-reanimated \
  react-native-reanimated-carousel \
  react-native-safe-area-context \
  react-native-screens \
  react-native-svg \
  react-native-toast-message \
  react-native-view-shot \
  react-native-web \
  react-native-webview \
  react-native-worklets \
  socket.io-client \
  zod \
  zustand
```

### Step 2.2: Install Dev Dependencies

```bash
pnpm add -D \
  @tanstack/eslint-plugin-query \
  @types/react \
  eslint \
  eslint-config-expo \
  prettier-plugin-tailwindcss \
  tailwindcss \
  typescript
```

### Step 2.3: Configure NativeWind (TailwindCSS)

Create `apps/raverpay-mobile/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        urbanist: ['Urbanist'],
        'urbanist-bold': ['Urbanist-Bold'],
      },
    },
  },
  plugins: [],
};
```

Create `apps/raverpay-mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update `apps/raverpay-mobile/babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### Step 2.4: Configure Expo Router

Create the app directory structure:

```bash
mkdir -p apps/raverpay-mobile/app
```

Create `apps/raverpay-mobile/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return <Stack />;
}
```

Create `apps/raverpay-mobile/app/index.tsx`:

```tsx
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">RaverPay Mobile</Text>
    </View>
  );
}
```

---

## Troubleshooting Guide

### Issue: pnpm install still hangs

**Solution 1**: Clear pnpm store and retry

```bash
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Solution 2**: Add more `.npmrc` options

```ini
node-linker=hoisted
hoist=true
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

### Issue: Metro can't find modules

**Solution**: Update Metro config to include monorepo paths (see Step 1.6)

### Issue: Native module not found during build

**Solution**: Run prebuild to regenerate native projects:

```bash
cd apps/raverpay-mobile
npx expo prebuild --clean
```

### Issue: Conflicting React versions

**Solution**: Add resolution overrides to root `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-native": "0.81.5"
    }
  }
}
```

### Issue: EAS Build fails

**Solution**: Ensure `eas.json` is configured for monorepo:

```json
{
  "build": {
    "production": {
      "node": "18.18.0",
      "pnpm": "8.15.0"
    }
  }
}
```

---

## Verification Checklist

### Phase 1 Verification

- [ ] `.npmrc` created with `node-linker=hoisted`
- [ ] `pnpm install` completes without hanging
- [ ] `apps/raverpay-mobile` directory exists
- [ ] `package.json` has `@raverpay/` prefix
- [ ] `npx expo start` runs successfully
- [ ] Development server launches without errors

### Phase 2 Verification

- [ ] All dependencies installed successfully
- [ ] NativeWind/TailwindCSS working
- [ ] Expo Router navigation working
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] iOS Simulator/Android Emulator launches

---

## Final package.json for Mobile App

```json
{
  "name": "@raverpay/raverpay-mobile",
  "main": "expo-router/entry",
  "version": "1.0.7",
  "private": true,
  "scripts": {
    "start": "expo start",
    "dev": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean"
  },
  "dependencies": {
    "@expo-google-fonts/urbanist": "^0.4.2",
    "@expo/vector-icons": "^15.0.3",
    "@hookform/resolvers": "^5.2.2",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-community/datetimepicker": "^8.5.0",
    "@react-native-community/netinfo": "^11.4.1",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@sentry/react-native": "^7.8.0",
    "@shopify/flash-list": "2.0.2",
    "@tanstack/query-async-storage-persister": "^5.90.9",
    "@tanstack/react-query": "^5.90.7",
    "axios": "^1.13.2",
    "date-fns": "^4.1.0",
    "expo": "~54.0.23",
    "expo-application": "^7.0.7",
    "expo-blur": "~15.0.7",
    "expo-clipboard": "^8.0.7",
    "expo-constants": "~18.0.10",
    "expo-contacts": "~15.0.10",
    "expo-crypto": "^15.0.7",
    "expo-dev-client": "~6.0.17",
    "expo-device": "~8.0.9",
    "expo-file-system": "^19.0.19",
    "expo-font": "~14.0.9",
    "expo-haptics": "~15.0.7",
    "expo-image": "~3.0.10",
    "expo-image-picker": "~17.0.8",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.8",
    "expo-local-authentication": "~17.0.7",
    "expo-notifications": "~0.32.13",
    "expo-print": "^15.0.7",
    "expo-router": "~6.0.14",
    "expo-secure-store": "~15.0.7",
    "expo-sharing": "^14.0.7",
    "expo-splash-screen": "~31.0.10",
    "expo-status-bar": "~3.0.8",
    "expo-store-review": "~9.0.8",
    "expo-symbols": "~1.0.7",
    "expo-system-ui": "~6.0.8",
    "expo-updates": "~29.0.13",
    "expo-web-browser": "~15.0.9",
    "nativewind": "^4.2.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.66.0",
    "react-native": "0.81.5",
    "react-native-css-interop": "^0.2.1",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-qrcode-svg": "^6.3.20",
    "react-native-reanimated": "~4.1.1",
    "react-native-reanimated-carousel": "^4.0.3",
    "react-native-safe-area-context": "5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "^15.15.0",
    "react-native-toast-message": "^2.3.3",
    "react-native-view-shot": "^4.0.3",
    "react-native-web": "~0.21.0",
    "react-native-webview": "13.15.0",
    "react-native-worklets": "0.5.1",
    "socket.io-client": "^4.8.1",
    "zod": "^3.25.76",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@tanstack/eslint-plugin-query": "^5.91.2",
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.2"
  }
}
```

---

## Summary

The **key insight** is that pnpm's default strict/isolated `node_modules` structure doesn't work well with React Native/Expo. The solution is simple:

1. **Create `.npmrc` with `node-linker=hoisted`** - This is the crucial fix!
2. **Configure Metro for monorepo paths** - So Metro can find packages
3. **Use `@raverpay/` package naming** - For consistency with existing apps
4. **Follow a phased approach** - Basic setup first, then full dependencies

Once these configurations are in place, pnpm will work seamlessly with Expo in your monorepo!
