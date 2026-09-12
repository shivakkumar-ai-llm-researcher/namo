# Community Fund Management Mobile App - Setup & Deployment Guide

This document provides step-by-step instructions for configuring, developing, and deploying the Community Fund Management mobile application built with **React Native**, **Expo SDK 57**, **TypeScript**, and **Supabase**.

---

## 1. Prerequisites

- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Git**: Installed and configured
- **Expo Go** or an Android Emulator / iOS Simulator
- **Supabase Account**: Free tier at [https://supabase.com](https://supabase.com)

---

## 2. Supabase Project Setup

### 2.1 Create Project
1. Log in to your [Supabase Dashboard](https://app.supabase.com).
2. Click **"New Project"**.
3. Set:
   - **Name**: `community-fund-management` (or preferred name)
   - **Database Password**: Choose a strong password and store it safely.
   - **Region**: Choose the closest region (e.g. `ap-south-1` for India / Mumbai).
4. Wait ~2 minutes for the database to provision.

### 2.2 Run Database Migrations
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. This will create:
   - `profiles` table linked to Supabase Auth (`auth.users`)
   - `members` table (community members directory)
   - `functions` table (Annual and Four-Year functions)
   - `contributions` table (with strict positive decimal amounts)
   - `expenses` table (10 categories with receipt URLs)
   - `audit_logs` table (immutable change log)
   - Stored SQL functions (`get_function_summary`, `get_dashboard_summary`, `is_admin`)
   - Row Level Security (RLS) policies on all tables

### 2.3 Run Seed Data (Optional for Development)
1. In the Supabase **SQL Editor**, open `supabase/seed.sql`.
2. Review the instructions in the comments.
3. If you want test data with realistic Tamil names and INR amounts, run `supabase/seed.sql`.

### 2.4 Create Storage Bucket for Receipts
1. In the Supabase Dashboard, go to **Storage** -> **Buckets**.
2. Click **"New Bucket"**.
3. Name: `receipts`.
4. Toggle **"Public bucket"** to **ON** (or configure signed URLs).
5. File size limit: `5MB`.
6. Allowed MIME types: `image/jpeg, image/png, image/webp, application/pdf`.
7. Under **Policies**:
   - Give **Authenticated** users `SELECT` access.
   - Give **Admins** `INSERT`, `UPDATE`, `DELETE` access.

---

## 3. Environment Variables Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
   *(Find these under Supabase Project Settings -> API -> Project URL & Project API Keys -> `anon` public)*

> [!IMPORTANT]
> Never expose your Supabase `service_role` key in the mobile application. Only the `anon` public key should be used in `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

---

## 4. Local Development

1. Install project dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. To run on Android:
   - Press `a` in the terminal (starts Android emulator or connected device), or scan the QR code using Expo Go.
4. To run on iOS:
   - Press `i` in the terminal (starts iOS simulator on macOS), or scan the QR code using Camera.
5. To test web preview:
   - Press `w` in the terminal.

---

## 5. User Roles & Authentication

The app uses Supabase Authentication with database-enforced roles:

### Admin Role
- **Capabilities**: Full CRUD on all financial records, member directory, function management, CSV reports, and audit logs.
- Can create, edit, and delete community functions, contributions, and expenses.
- Can upload and delete receipts.

### Visitor Role
- **Capabilities**: Read-only transparency dashboard, community contribution list, personal contribution records, expense breakdown with receipt viewing, and analytics.
- **Enforcement**: Database Row Level Security (RLS) blocks visitors from modifying financial tables even via direct API calls.

To grant admin privileges to a user:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<user-uuid-from-auth.users>';
```

---

## 6. Production Builds

### 6.1 Install EAS CLI
```bash
npm install -g eas-cli
eas login
eas project:init
```

### 6.2 Build Android APK / AAB
```bash
# Build standalone Android APK for direct testing
eas build --platform android --profile preview

# Build Google Play AAB bundle for release
eas build --platform android --profile production
```

### 6.3 Build iOS IPA
```bash
# Build iOS Simulator build
eas build --platform ios --profile preview

# Build App Store release
eas build --platform ios --profile production
```

---

## 7. Architecture Overview

```
namo/
├── app/                         # Expo Router navigation tree
│   ├── _layout.tsx              # Root theme & auth gate layout
│   ├── index.tsx                # Dynamic route gate
│   ├── (auth)/                  # Auth screens (Login, Forgot Password)
│   ├── (admin)/                 # Admin tab navigation & feature screens
│   │   ├── index.tsx            # Financial dashboard
│   │   ├── contributions/       # Contributions management
│   │   ├── expenses/            # Expenses & receipt upload
│   │   ├── analytics/           # Annual & Four-Year analytics
│   │   └── more/                # Functions, Members, Savings, Reports, Logs, Settings
│   └── (visitor)/               # Visitor tab navigation & read-only screens
│       ├── index.tsx            # Visitor dashboard
│       ├── contributions/       # Transparency contributions list
│       ├── expenses/            # Expenses with receipt viewer
│       ├── analytics/           # Public financial analytics
│       └── profile/             # Profile & Personal donation history
├── src/
│   ├── components/ui/           # Reusable UI primitives (Card, StatCard, Badge, Button, Input, Skeleton)
│   ├── i18n/                    # English & Tamil translations with persistence
│   ├── services/                # Supabase client, auth, contributions, expenses, members, reports, storage
│   ├── store/                   # Zustand lightweight state management
│   ├── theme/                   # Light & Dark design tokens and ThemeProvider
│   ├── types/                   # Strict TypeScript schemas
│   └── utils/                   # Formatters (INR currency, dates), Zod validators, error handler
└── supabase/
    ├── migrations/              # PostgreSQL schema with RLS
    └── seed.sql                 # Sample community data
```

---

## 8. Verification & Test Commands

- **Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Export Bundle**:
  ```bash
  npx expo export --platform android
  ```
