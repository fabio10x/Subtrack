-- SubTrack schema (Clerk auth + Supabase database)
-- User identity is the Clerk user ID (the JWT "sub" claim), stored as text.
-- Supabase accepts Clerk session tokens (Authentication > Third-party auth > Clerk),
-- so auth.jwt()->>'sub' returns the signed-in Clerk user ID inside RLS policies.

-- Enable UUID extension (used for subscription/notification row IDs)
create extension if not exists "uuid-ossp";

-- Helper: the current Clerk user ID from the request token
create or replace function public.subtrack_current_user_id()
returns text
language sql
stable
as $$
  select auth.jwt()->>'sub';
$$;

-- 1. Profiles (one row per Clerk user, created on first sign-in by the client)
create table public.subtrack_profiles (
  id text primary key,
  email text not null,
  name text,
  avatar_url text,
  tier text default 'free' check (tier in ('free', 'pro')),
  preferred_currency text default 'USD',
  alert_lead_days integer default 3,
  email_alerts_enabled boolean default true,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subtrack_profiles enable row level security;

create policy "Users can view own profile."
  on subtrack_profiles for select
  using ( public.subtrack_current_user_id() = id );

create policy "Users can insert own profile."
  on subtrack_profiles for insert
  with check ( public.subtrack_current_user_id() = id );

create policy "Users can update own profile."
  on subtrack_profiles for update
  using ( public.subtrack_current_user_id() = id )
  with check ( public.subtrack_current_user_id() = id );

-- Column-level lock: clients may only edit user-facing fields.
-- Billing fields (tier, stripe_*, subscription_expires_at) are writable only by
-- the service role (Netlify functions / Stripe webhook), which bypasses these grants.
revoke update on public.subtrack_profiles from authenticated, anon;
grant update (email, name, avatar_url, preferred_currency, alert_lead_days, email_alerts_enabled, updated_at)
  on public.subtrack_profiles to authenticated;
grant insert (id, email, name, avatar_url) on public.subtrack_profiles to authenticated;


-- 2. Subscriptions
create table public.subtrack_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.subtrack_profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text not null,
  cost numeric not null default 0,
  currency text not null default 'USD',
  billing_cycle text not null default 'monthly',
  payment_method text not null,
  start_date date not null,
  next_renewal_date date not null,
  status text not null default 'active',

  is_free_trial boolean default false,
  trial_start_date date,
  trial_end_date date,
  auto_renews_after_trial boolean default true,
  trial_converted_cost numeric,

  icon_url text,
  brand_color text default '#3B82F6',
  website_url text,
  cancel_url text,
  notes text,
  alert_days_before integer default 3,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subtrack_subscriptions enable row level security;

create policy "Users can view own subscriptions."
  on subtrack_subscriptions for select
  using ( public.subtrack_current_user_id() = user_id );

create policy "Users can insert own subscriptions."
  on subtrack_subscriptions for insert
  with check ( public.subtrack_current_user_id() = user_id );

create policy "Users can update own subscriptions."
  on subtrack_subscriptions for update
  using ( public.subtrack_current_user_id() = user_id )
  with check ( public.subtrack_current_user_id() = user_id );

create policy "Users can delete own subscriptions."
  on subtrack_subscriptions for delete
  using ( public.subtrack_current_user_id() = user_id );


-- 3. Notifications
create table public.subtrack_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.subtrack_profiles(id) on delete cascade not null,
  subscription_id uuid references public.subtrack_subscriptions(id) on delete cascade,
  subscription_name text not null,
  type text not null,
  title text not null,
  message text not null,
  renewal_date date,
  amount numeric,
  currency text,
  days_remaining integer,
  sent_at timestamp with time zone default timezone('utc'::text, now()),
  status text default 'sent',
  email_recipient text not null,
  email_html_preview text,
  read boolean default false,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subtrack_notifications enable row level security;

create policy "Users can view own notifications."
  on subtrack_notifications for select
  using ( public.subtrack_current_user_id() = user_id );

create policy "Users can update own notifications."
  on subtrack_notifications for update
  using ( public.subtrack_current_user_id() = user_id )
  with check ( public.subtrack_current_user_id() = user_id );

create policy "Users can delete own notifications."
  on subtrack_notifications for delete
  using ( public.subtrack_current_user_id() = user_id );


-- 4. Tier limits (free tier: max 5 active/trial subscriptions)
create or replace function public.check_free_tier_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_tier text;
  active_count integer;
begin
  select tier into user_tier from public.subtrack_profiles where id = new.user_id;

  if user_tier = 'free' then
    select count(*) into active_count
    from public.subtrack_subscriptions
    where user_id = new.user_id and status in ('active', 'trial');

    if active_count >= 5 and new.status in ('active', 'trial') then
      raise exception 'Free tier limit reached. You can only have 5 active or trial subscriptions.';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_free_tier_limit
  before insert on public.subtrack_subscriptions
  for each row execute procedure public.check_free_tier_limit();

-- Also enforce the limit when an existing subscription is reactivated (e.g. paused -> active)
create trigger enforce_free_tier_limit_on_update
  before update of status on public.subtrack_subscriptions
  for each row
  when (new.status in ('active', 'trial') and old.status is distinct from new.status)
  execute procedure public.check_free_tier_limit();
