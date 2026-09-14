-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends auth.users)
create table public.subtrack_profiles (
  id uuid references auth.users on delete cascade not null primary key,
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

-- Enable RLS on profiles
alter table public.subtrack_profiles enable row level security;

-- Profiles Policies
create policy "Users can view own profile."
  on subtrack_profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile."
  on subtrack_profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.subtrack_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subtrack_profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger subtrack_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.subtrack_handle_new_user();


-- 2. Create Subscriptions Table
create table public.subtrack_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.subtrack_profiles(id) on delete cascade not null,
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

-- Enable RLS on subscriptions
alter table public.subtrack_subscriptions enable row level security;

-- Subscriptions Policies
create policy "Users can view own subscriptions."
  on subtrack_subscriptions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own subscriptions."
  on subtrack_subscriptions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own subscriptions."
  on subtrack_subscriptions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own subscriptions."
  on subtrack_subscriptions for delete
  using ( auth.uid() = user_id );


-- 3. Create Notifications Table
create table public.subtrack_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.subtrack_profiles(id) on delete cascade not null,
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

-- Enable RLS on notifications
alter table public.subtrack_notifications enable row level security;

-- Notifications Policies
create policy "Users can view own notifications."
  on subtrack_notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update own notifications."
  on subtrack_notifications for update
  using ( auth.uid() = user_id );

create policy "Users can delete own notifications."
  on subtrack_notifications for delete
  using ( auth.uid() = user_id );

-- 4. Tier Limits Enforcement
create or replace function public.check_free_tier_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_tier text;
  active_count integer;
begin
  -- Get the user's tier
  select tier into user_tier from public.subtrack_profiles where id = new.user_id;
  
  -- If free tier, check count
  if user_tier = 'free' then
    select count(*) into active_count 
    from public.subtrack_subscriptions 
    where user_id = new.user_id and status in ('active', 'trial');
    
    -- If inserting a new active/trial subscription would exceed 5, block it
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
