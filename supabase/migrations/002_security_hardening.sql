-- ============================================================
-- Migration: 002_security_hardening.sql
-- Description: Production security hardening for Namo app
-- Created: 2026-09-10
-- ============================================================

-- ============================================
-- 1. PREVENT PROFILE ROLE SELF-ESCALATION
-- ============================================
-- Drop the overly permissive "users can update own profile" policy
-- and replace with a column-restricted version.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users may update only safe display fields — NOT role
CREATE POLICY "Users can update own safe fields" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- The role column must remain unchanged
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Trigger to hard-enforce role immutability for non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- If role is changing and the caller is not already an admin — reject
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Permission denied: you cannot change your own role'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_immutability ON public.profiles;
CREATE TRIGGER enforce_role_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();


-- ============================================
-- 2. AMOUNT CONSTRAINTS (POSITIVE VALUES)
-- ============================================
-- Contributions: amount must be positive
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contributions_amount_positive'
  ) THEN
    ALTER TABLE public.contributions
      ADD CONSTRAINT contributions_amount_positive CHECK (amount > 0);
  END IF;
END $$;

-- Expenses: amount must be positive
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'expenses_amount_positive'
  ) THEN
    ALTER TABLE public.expenses
      ADD CONSTRAINT expenses_amount_positive CHECK (amount > 0);
  END IF;
END $$;


-- ============================================
-- 3. FUNCTION YEAR VALIDATION
-- ============================================
-- Enforce four_year functions span exactly 4 calendar years
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'functions_four_year_span'
  ) THEN
    ALTER TABLE public.functions
      ADD CONSTRAINT functions_four_year_span CHECK (
        type = 'ANNUAL'
        OR (type = 'FOUR_YEAR' AND end_year IS NOT NULL AND end_year = start_year + 3)
      );
  END IF;
END $$;


-- ============================================
-- 4. SOFT DELETION SUPPORT
-- ============================================
-- Add deleted_at column for soft deletes on financial records
ALTER TABLE public.contributions
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;


-- ============================================
-- 5. DATABASE-LEVEL AUDIT TRIGGERS
-- ============================================
-- Ensure audit_logs table has old_data and new_data columns
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS old_data jsonb DEFAULT NULL;
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS new_data jsonb DEFAULT NULL;

-- Audit trigger function for financial tables
CREATE OR REPLACE FUNCTION public.log_financial_audit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_action text;
  v_entity_type text;
  v_entity_id uuid;
  v_old_data jsonb;
  v_new_data jsonb;
BEGIN
  v_entity_type := TG_TABLE_NAME;

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_entity_id := NEW.id;
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_entity_id := NEW.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_entity_id := OLD.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    v_action,
    v_entity_type,
    v_entity_id,
    v_old_data,
    v_new_data,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply audit trigger to contributions
DROP TRIGGER IF EXISTS audit_contributions ON public.contributions;
CREATE TRIGGER audit_contributions
  AFTER INSERT OR UPDATE OR DELETE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.log_financial_audit();

-- Apply audit trigger to expenses
DROP TRIGGER IF EXISTS audit_expenses ON public.expenses;
CREATE TRIGGER audit_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.log_financial_audit();

-- Apply audit trigger to functions
DROP TRIGGER IF EXISTS audit_functions ON public.functions;
CREATE TRIGGER audit_functions
  AFTER INSERT OR UPDATE OR DELETE ON public.functions
  FOR EACH ROW EXECUTE FUNCTION public.log_financial_audit();


-- ============================================
-- 6. PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contributions_function_date
  ON public.contributions (function_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_contributions_member
  ON public.contributions (member_id);

CREATE INDEX IF NOT EXISTS idx_expenses_function_date
  ON public.expenses (function_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category
  ON public.expenses (function_id, category);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_type, entity_id, created_at DESC);


-- ============================================
-- 7. AUTHORITATIVE AGGREGATION RPCs (EXACT NUMERIC)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_function_summary(p_function_id uuid)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT json_build_object(
    'total_contributions',
      COALESCE((SELECT SUM(amount)::numeric(15,2) FROM public.contributions
                WHERE function_id = p_function_id AND deleted_at IS NULL), 0),
    'total_expenses',
      COALESCE((SELECT SUM(amount)::numeric(15,2) FROM public.expenses
                WHERE function_id = p_function_id AND deleted_at IS NULL), 0),
    'balance',
      COALESCE((SELECT SUM(amount)::numeric(15,2) FROM public.contributions
                WHERE function_id = p_function_id AND deleted_at IS NULL), 0)
      - COALESCE((SELECT SUM(amount)::numeric(15,2) FROM public.expenses
                  WHERE function_id = p_function_id AND deleted_at IS NULL), 0),
    'contributor_count',
      (SELECT COUNT(DISTINCT member_id) FROM public.contributions
       WHERE function_id = p_function_id AND deleted_at IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_function_id uuid DEFAULT NULL)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT json_build_object(
    'total_contributions',
      COALESCE(
        CASE WHEN p_function_id IS NOT NULL
          THEN (SELECT SUM(amount)::numeric(15,2) FROM public.contributions
                WHERE function_id = p_function_id AND deleted_at IS NULL)
          ELSE (SELECT SUM(amount)::numeric(15,2) FROM public.contributions
                WHERE deleted_at IS NULL)
        END, 0
      ),
    'total_expenses',
      COALESCE(
        CASE WHEN p_function_id IS NOT NULL
          THEN (SELECT SUM(amount)::numeric(15,2) FROM public.expenses
                WHERE function_id = p_function_id AND deleted_at IS NULL)
          ELSE (SELECT SUM(amount)::numeric(15,2) FROM public.expenses
                WHERE deleted_at IS NULL)
        END, 0
      ),
    'balance',
      COALESCE(
        CASE WHEN p_function_id IS NOT NULL
          THEN (SELECT SUM(amount)::numeric(15,2) FROM public.contributions
                WHERE function_id = p_function_id AND deleted_at IS NULL)
          ELSE (SELECT SUM(amount)::numeric(15,2) FROM public.contributions WHERE deleted_at IS NULL)
        END, 0
      ) - COALESCE(
        CASE WHEN p_function_id IS NOT NULL
          THEN (SELECT SUM(amount)::numeric(15,2) FROM public.expenses
                WHERE function_id = p_function_id AND deleted_at IS NULL)
          ELSE (SELECT SUM(amount)::numeric(15,2) FROM public.expenses WHERE deleted_at IS NULL)
        END, 0
      ),
    'contributor_count',
      CASE WHEN p_function_id IS NOT NULL
        THEN (SELECT COUNT(DISTINCT member_id) FROM public.contributions
              WHERE function_id = p_function_id AND deleted_at IS NULL)
        ELSE (SELECT COUNT(DISTINCT member_id) FROM public.contributions WHERE deleted_at IS NULL)
      END
  );
$$;


-- ============================================
-- 8. RECEIPTS BUCKET STORAGE POLICIES
-- ============================================
-- These SQL statements configure storage policies for the private receipts bucket.
-- Run AFTER creating the bucket as private in the Supabase Storage dashboard.

-- Allow authenticated users to upload their own receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: Admins can do everything in receipts bucket
DROP POLICY IF EXISTS "Admins can manage receipts" ON storage.objects;
CREATE POLICY "Admins can manage receipts" ON storage.objects
  FOR ALL USING (
    bucket_id = 'receipts' AND public.is_admin()
  );

-- Storage RLS: Authenticated users can upload receipts
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND auth.uid() IS NOT NULL
  );

-- Storage RLS: Authenticated users can read receipts they have access to
DROP POLICY IF EXISTS "Authenticated users can read receipts" ON storage.objects;
CREATE POLICY "Authenticated users can read receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND auth.uid() IS NOT NULL
  );
