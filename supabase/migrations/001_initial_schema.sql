-- ============================================================
-- Migration: 001_initial_schema.sql
-- Description: Initial schema for Community Fund Management App
-- Created: 2026-09-02
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'visitor' check (role in ('admin', 'visitor')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'visitor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- MEMBERS
-- ============================================
create table public.members (
  id uuid primary key default uuid_generate_v4(),
  member_id text unique not null,
  full_name text not null,
  phone text,
  email text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  join_date date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.members enable row level security;
create trigger members_updated_at before update on public.members
  for each row execute procedure public.update_updated_at_column();
create index idx_members_status on public.members(status);
create index idx_members_created_at on public.members(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================
create table public.functions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('ANNUAL', 'FOUR_YEAR')),
  start_year int not null,
  end_year int,
  description text,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed', 'archived')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.functions enable row level security;
create trigger functions_updated_at before update on public.functions
  for each row execute procedure public.update_updated_at_column();
create index idx_functions_type on public.functions(type);
create index idx_functions_status on public.functions(status);
create index idx_functions_start_year on public.functions(start_year);

-- ============================================
-- CONTRIBUTIONS
-- ============================================
create table public.contributions (
  id uuid primary key default uuid_generate_v4(),
  function_id uuid not null references public.functions(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete restrict,
  amount numeric(15,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'upi', 'bank_transfer', 'other')),
  payment_date date not null,
  reference_number text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contributions enable row level security;
create trigger contributions_updated_at before update on public.contributions
  for each row execute procedure public.update_updated_at_column();
create index idx_contributions_function_id on public.contributions(function_id);
create index idx_contributions_member_id on public.contributions(member_id);
create index idx_contributions_payment_date on public.contributions(payment_date);
create index idx_contributions_created_at on public.contributions(created_at);

-- ============================================
-- EXPENSES
-- ============================================
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  function_id uuid not null references public.functions(id) on delete restrict,
  category text not null check (category in ('food', 'hall', 'decoration', 'transportation', 'cultural_religious', 'printing', 'sound_system', 'gifts', 'utilities', 'miscellaneous')),
  description text not null,
  amount numeric(15,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash', 'upi', 'bank_transfer', 'other')),
  expense_date date not null,
  reference_number text,
  notes text,
  receipt_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses enable row level security;
create trigger expenses_updated_at before update on public.expenses
  for each row execute procedure public.update_updated_at_column();
create index idx_expenses_function_id on public.expenses(function_id);
create index idx_expenses_category on public.expenses(category);
create index idx_expenses_expense_date on public.expenses(expense_date);
create index idx_expenses_created_at on public.expenses(created_at);

-- ============================================
-- AUDIT LOGS
-- ============================================
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  action text not null check (action in ('created', 'updated', 'deleted')),
  entity text not null check (entity in ('contribution', 'expense', 'function', 'member')),
  entity_id uuid not null,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_entity on public.audit_logs(entity);
create index idx_audit_logs_entity_id on public.audit_logs(entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get function financial summary
create or replace function public.get_function_summary(p_function_id uuid)
returns table(
  total_contributions numeric,
  total_expenses numeric,
  balance numeric,
  contributor_count bigint
) language sql security definer set search_path = public
as $$
  select
    coalesce(sum(c.amount), 0) as total_contributions,
    coalesce(sum(e.amount), 0) as total_expenses,
    coalesce(sum(c.amount), 0) - coalesce(sum(e.amount), 0) as balance,
    count(distinct c.member_id) as contributor_count
  from public.functions f
  left join public.contributions c on c.function_id = f.id
  left join public.expenses e on e.function_id = f.id
  where f.id = p_function_id;
$$;

-- Get dashboard summary
create or replace function public.get_dashboard_summary(p_function_id uuid)
returns json language sql security definer set search_path = public
as $$
  select json_build_object(
    'total_contributions', coalesce((select sum(amount) from public.contributions where function_id = p_function_id), 0),
    'total_expenses', coalesce((select sum(amount) from public.expenses where function_id = p_function_id), 0),
    'balance', coalesce((select sum(amount) from public.contributions where function_id = p_function_id), 0) - coalesce((select sum(amount) from public.expenses where function_id = p_function_id), 0),
    'contributor_count', (select count(distinct member_id) from public.contributions where function_id = p_function_id)
  );
$$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

-- MEMBERS policies
create policy "Authenticated users can view active members" on public.members
  for select using (auth.uid() is not null and (status = 'active' or public.is_admin()));
create policy "Admins can insert members" on public.members
  for insert with check (public.is_admin());
create policy "Admins can update members" on public.members
  for update using (public.is_admin());
create policy "Admins can delete members" on public.members
  for delete using (public.is_admin());

-- FUNCTIONS policies
create policy "Authenticated users can view functions" on public.functions
  for select using (auth.uid() is not null);
create policy "Admins can insert functions" on public.functions
  for insert with check (public.is_admin());
create policy "Admins can update functions" on public.functions
  for update using (public.is_admin());
create policy "Admins can delete functions" on public.functions
  for delete using (public.is_admin());

-- CONTRIBUTIONS policies
create policy "Authenticated users can view contributions" on public.contributions
  for select using (auth.uid() is not null);
create policy "Admins can insert contributions" on public.contributions
  for insert with check (public.is_admin());
create policy "Admins can update contributions" on public.contributions
  for update using (public.is_admin());
create policy "Admins can delete contributions" on public.contributions
  for delete using (public.is_admin());

-- EXPENSES policies
create policy "Authenticated users can view expenses" on public.expenses
  for select using (auth.uid() is not null);
create policy "Admins can insert expenses" on public.expenses
  for insert with check (public.is_admin());
create policy "Admins can update expenses" on public.expenses
  for update using (public.is_admin());
create policy "Admins can delete expenses" on public.expenses
  for delete using (public.is_admin());

-- AUDIT_LOGS policies
create policy "Admins can view audit logs" on public.audit_logs
  for select using (public.is_admin());
create policy "System can insert audit logs" on public.audit_logs
  for insert with check (auth.uid() is not null);
