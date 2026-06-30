create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'SubGroup Manager',
  site_logo_url text,
  site_description text,
  primary_color text,
  accent_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.file_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.file_folders(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.telegram_settings
  add column if not exists reminder_days_before integer not null default 3,
  add column if not exists default_message_template text;

comment on column public.telegram_settings.default_message_template is 'Prototype-visible template. Keep bot token and chat id encrypted/server-side in production.';

create table if not exists public.app_account_stock (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete set null,
  label text,
  login_email text,
  password_encrypted text,
  account_type text check (account_type in ('private', 'shared')),
  cost numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'expired', 'problem')),
  purchase_date date,
  expiry_date date,
  supplier text,
  note text,
  image_url text,
  folder_file_id uuid references public.uploaded_files(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.app_account_stock.password_encrypted is 'Encrypted app account credential payload only. Never store plain text passwords in production.';
comment on table public.app_account_stock is 'Separate stock inventory. Later, sold or assigned stock can be converted into service_accounts or linked to share_groups.';

create index if not exists uploaded_files_folder_id_idx on public.uploaded_files(folder_id);
create index if not exists app_account_stock_app_id_idx on public.app_account_stock(app_id);
create index if not exists app_account_stock_status_idx on public.app_account_stock(status);
create index if not exists app_account_stock_expiry_date_idx on public.app_account_stock(expiry_date);

alter table public.app_settings enable row level security;
alter table public.file_folders enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.app_account_stock enable row level security;

create policy "Authenticated admins can manage app settings" on public.app_settings for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage file folders" on public.file_folders for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage uploaded files" on public.uploaded_files for all to authenticated using (true) with check (true);
create policy "Authenticated admins can manage app account stock" on public.app_account_stock for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('admin-files', 'admin-files', false)
on conflict (id) do nothing;
