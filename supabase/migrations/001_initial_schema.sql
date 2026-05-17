create extension if not exists "pgcrypto";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  dodo_subscription_id text unique,
  dodo_customer_id text,
  status text not null default 'inactive'
    check (status in ('inactive','pending','active','on_hold','cancelled','expired')),
  product_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Sandboxes table
create table public.sandboxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id),
  blaxel_sandbox_name text unique not null,
  status text not null default 'pending'
    check (status in ('pending','provisioning','running','standby','error','deleted')),
  region text default 'us-pdx-1',
  sandbox_url text,
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Telegram configs table
create table public.telegram_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sandbox_id uuid references public.sandboxes(id),
  bot_token_encrypted text not null,
  bot_username text,
  is_connected boolean default false,
  webhook_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_dodo_id on public.subscriptions(dodo_subscription_id);
create index idx_sandboxes_user_id on public.sandboxes(user_id);
create index idx_telegram_configs_user_id on public.telegram_configs(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.sandboxes enable row level security;
alter table public.telegram_configs enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own subscriptions"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Users can view own sandboxes"
  on public.sandboxes for select using (auth.uid() = user_id);

create policy "Users can view own telegram config"
  on public.telegram_configs for select using (auth.uid() = user_id);

create policy "Users can update own telegram config"
  on public.telegram_configs for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, 'anonymous_' || new.id::text),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
