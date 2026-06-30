create extension if not exists pgcrypto;

create type app_status as enum ('active', 'paused', 'archived');
create type paid_status as enum ('paid', 'unpaid', 'partial');
create type renewal_intent as enum ('yes', 'no', 'unknown');
create type transaction_type as enum ('income', 'expense');
create type reminder_status as enum ('prepared', 'sent', 'failed');

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  color text not null default '#0f766e',
  default_seats integer not null default 1 check (default_seats > 0),
  note text,
  status app_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_accounts (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  label text not null,
  login_email text not null,
  password_encrypted text,
  password_hint text,
  expiry_date date not null,
  cost numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.service_accounts.password_encrypted is 'Encrypted credential payload only. Never store or expose plain text passwords.';

create table public.share_groups (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  service_account_id uuid not null references public.service_accounts(id) on delete restrict,
  group_name text not null,
  seats_total integer not null check (seats_total > 0),
  expiry_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  full_name text not null,
  phone text,
  line_id text,
  facebook_url text,
  telegram_username text,
  profile_image_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.share_groups(id) on delete cascade,
  seat_no integer not null check (seat_no > 0),
  customer_id uuid not null references public.customers(id) on delete restrict,
  paid_status paid_status not null default 'unpaid',
  paid_amount numeric(12,2) not null default 0,
  payment_date date,
  wants_renewal renewal_intent not null default 'unknown',
  member_expiry_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, seat_no),
  unique (group_id, customer_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type transaction_type not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  app_id uuid references public.apps(id) on delete set null,
  group_id uuid references public.share_groups(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  date date not null,
  note text,
  slip_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telegram_settings (
  id uuid primary key default gen_random_uuid(),
  bot_token_encrypted text,
  bot_token_hint text,
  chat_id_encrypted text,
  chat_id_hint text,
  reminder_days_before_expiry integer not null default 3 check (reminder_days_before_expiry >= 0),
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.telegram_settings.bot_token_encrypted is 'Encrypted Telegram bot token. Never store or expose plain text tokens.';
comment on column public.telegram_settings.chat_id_encrypted is 'Encrypted Telegram chat id. Keep server-side only.';

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.share_groups(id) on delete cascade,
  telegram_settings_id uuid not null references public.telegram_settings(id) on delete cascade,
  message text not null,
  status reminder_status not null default 'prepared',
  error_message text,
  created_at timestamptz not null default now()
);

create index service_accounts_app_id_idx on public.service_accounts(app_id);
create index share_groups_app_id_idx on public.share_groups(app_id);
create index share_groups_expiry_date_idx on public.share_groups(expiry_date);
create index group_members_group_id_idx on public.group_members(group_id);
create index transactions_date_idx on public.transactions(date);
create index transactions_type_idx on public.transactions(type);

alter table public.apps enable row level security;
alter table public.service_accounts enable row level security;
alter table public.share_groups enable row level security;
alter table public.customers enable row level security;
alter table public.group_members enable row level security;
alter table public.transactions enable row level security;
alter table public.telegram_settings enable row level security;
alter table public.reminder_logs enable row level security;

create policy "Authenticated admins can manage apps" on public.apps for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage service accounts" on public.service_accounts for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage share groups" on public.share_groups for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage customers" on public.customers for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage group members" on public.group_members for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage transactions" on public.transactions for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage telegram settings" on public.telegram_settings for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage reminder logs" on public.reminder_logs for all to authenticated using (true) with check (true);
