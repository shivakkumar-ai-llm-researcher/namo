# Srivari Community Fund (Namo)

A modern, full-stack community fund and festival accounting platform for Tirupati Balaji devotees.

---

## Repository Structure & Branches

This repository is organized into dedicated branches:

- **`main` (Current Branch)**: Contains the **Next.js Web Application** and the **Supabase Backend** (`supabase/`).
- **`mobile` Branch**: Contains the **React Native / Expo SDK 57 Mobile Application**.
  To access the mobile codebase:
  ```bash
  git checkout mobile
  ```

---

## 1. Web Application (`main` branch)

Built with:
- **Next.js 16** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4**
- **Supabase SSR** (`@supabase/ssr`)
- **Panchangam Engine**: `@ishubhamx/panchangam-js` with Tamil astronomical computations
- **Languages**: English & Tamil (`தமிழ்`)

### Quick Start (Web App)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Set your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 2. Backend (`supabase/` folder on `main`)

The backend is powered by **Supabase (PostgreSQL)** with Row Level Security (RLS), Edge Functions, and automated audit logs.

### Backend Structure:
- `supabase/migrations/001_initial_schema.sql`: Core schema (members, functions, contributions, expenses, audit logs, RLS policies, stored functions).
- `supabase/migrations/002_security_hardening.sql`: Security hardening and role validation.
- `supabase/functions/ai-assistant/`: Supabase Edge Function for AI-assisted operations.
- `supabase/seed.sql`: Realistic seed data with Tamil devotee records and sample financial transactions.

### Setting Up Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql` followed by `002_security_hardening.sql`.
3. (Optional) Run `supabase/seed.sql` to populate sample devotee records.
4. Create a storage bucket named `receipts` for receipt uploads.

---

## 3. Mobile Application (`mobile` branch)

The mobile application is built using **Expo SDK 57**, **React Native**, and **TypeScript**.

To switch to the mobile app:
```bash
git checkout mobile
npm install
npx expo start
```
