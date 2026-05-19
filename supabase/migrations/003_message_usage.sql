create table public.message_usage (
  id uuid primary key default gen_random_uuid(),
  sandbox_id uuid not null references public.sandboxes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  telegram_update_id bigint not null,
  message_date date not null default current_date,
  created_at timestamptz default now() not null
);

create index idx_message_usage_sandbox_date on public.message_usage(sandbox_id, message_date);
create unique index idx_message_usage_unique_update on public.message_usage(sandbox_id, telegram_update_id);

alter table public.message_usage enable row level security;
create policy "Users can view own message usage"
  on public.message_usage for select using (auth.uid() = user_id);

alter table public.telegram_configs add column webhook_secret text;
