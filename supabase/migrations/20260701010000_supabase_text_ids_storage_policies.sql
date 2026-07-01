create extension if not exists pgcrypto;

alter table if exists public.service_accounts drop constraint if exists service_accounts_app_id_fkey;
alter table if exists public.share_groups drop constraint if exists share_groups_app_id_fkey;
alter table if exists public.share_groups drop constraint if exists share_groups_service_account_id_fkey;
alter table if exists public.group_members drop constraint if exists group_members_group_id_fkey;
alter table if exists public.group_members drop constraint if exists group_members_customer_id_fkey;
alter table if exists public.transactions drop constraint if exists transactions_app_id_fkey;
alter table if exists public.transactions drop constraint if exists transactions_group_id_fkey;
alter table if exists public.transactions drop constraint if exists transactions_customer_id_fkey;
alter table if exists public.reminder_logs drop constraint if exists reminder_logs_group_id_fkey;
alter table if exists public.reminder_logs drop constraint if exists reminder_logs_telegram_settings_id_fkey;
alter table if exists public.uploaded_files drop constraint if exists uploaded_files_folder_id_fkey;
alter table if exists public.app_account_stock drop constraint if exists app_account_stock_app_id_fkey;
alter table if exists public.app_account_stock drop constraint if exists app_account_stock_folder_file_id_fkey;

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('apps', 'id'),
      ('service_accounts', 'id'),
      ('service_accounts', 'app_id'),
      ('share_groups', 'id'),
      ('share_groups', 'app_id'),
      ('share_groups', 'service_account_id'),
      ('customers', 'id'),
      ('group_members', 'id'),
      ('group_members', 'group_id'),
      ('group_members', 'customer_id'),
      ('transactions', 'id'),
      ('transactions', 'app_id'),
      ('transactions', 'group_id'),
      ('transactions', 'customer_id'),
      ('telegram_settings', 'id'),
      ('reminder_logs', 'id'),
      ('reminder_logs', 'group_id'),
      ('reminder_logs', 'telegram_settings_id'),
      ('app_settings', 'id'),
      ('file_folders', 'id'),
      ('uploaded_files', 'id'),
      ('uploaded_files', 'folder_id'),
      ('app_account_stock', 'id'),
      ('app_account_stock', 'app_id'),
      ('app_account_stock', 'folder_file_id')
    ) as columns(table_name, column_name)
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = item.table_name
        and column_name = item.column_name
        and data_type = 'uuid'
    ) then
      execute format('alter table public.%I alter column %I drop default', item.table_name, item.column_name);
      execute format('alter table public.%I alter column %I type text using %I::text', item.table_name, item.column_name, item.column_name);
    end if;
  end loop;
end $$;

alter table if exists public.apps alter column id set default ('app-' || gen_random_uuid()::text);
alter table if exists public.service_accounts alter column id set default ('svc-' || gen_random_uuid()::text);
alter table if exists public.share_groups alter column id set default ('grp-' || gen_random_uuid()::text);
alter table if exists public.customers alter column id set default ('cus-' || gen_random_uuid()::text);
alter table if exists public.group_members alter column id set default ('mem-' || gen_random_uuid()::text);
alter table if exists public.transactions alter column id set default ('txn-' || gen_random_uuid()::text);
alter table if exists public.telegram_settings alter column id set default ('tg-' || gen_random_uuid()::text);
alter table if exists public.reminder_logs alter column id set default ('rem-' || gen_random_uuid()::text);
alter table if exists public.app_settings alter column id set default ('settings-' || gen_random_uuid()::text);
alter table if exists public.file_folders alter column id set default ('folder-' || gen_random_uuid()::text);
alter table if exists public.uploaded_files alter column id set default ('file-' || gen_random_uuid()::text);
alter table if exists public.app_account_stock alter column id set default ('stock-' || gen_random_uuid()::text);

alter table if exists public.service_accounts
  add column if not exists account_type text not null default 'shared',
  add column if not exists password text;

alter table if exists public.app_account_stock
  add column if not exists password text;

alter table if exists public.transactions
  add column if not exists color text;

alter table if exists public.telegram_settings
  add column if not exists bot_token text,
  add column if not exists chat_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'service_accounts_account_type_check'
  ) then
    alter table public.service_accounts
      add constraint service_accounts_account_type_check check (account_type in ('private', 'shared'));
  end if;
end $$;

alter table if exists public.service_accounts
  add constraint service_accounts_app_id_fkey foreign key (app_id) references public.apps(id) on delete cascade;

alter table if exists public.share_groups
  add constraint share_groups_app_id_fkey foreign key (app_id) references public.apps(id) on delete cascade,
  add constraint share_groups_service_account_id_fkey foreign key (service_account_id) references public.service_accounts(id) on delete restrict;

alter table if exists public.group_members
  add constraint group_members_group_id_fkey foreign key (group_id) references public.share_groups(id) on delete cascade,
  add constraint group_members_customer_id_fkey foreign key (customer_id) references public.customers(id) on delete restrict;

alter table if exists public.transactions
  add constraint transactions_app_id_fkey foreign key (app_id) references public.apps(id) on delete set null,
  add constraint transactions_group_id_fkey foreign key (group_id) references public.share_groups(id) on delete set null,
  add constraint transactions_customer_id_fkey foreign key (customer_id) references public.customers(id) on delete set null;

alter table if exists public.reminder_logs
  add constraint reminder_logs_group_id_fkey foreign key (group_id) references public.share_groups(id) on delete cascade,
  add constraint reminder_logs_telegram_settings_id_fkey foreign key (telegram_settings_id) references public.telegram_settings(id) on delete cascade;

alter table if exists public.uploaded_files
  add constraint uploaded_files_folder_id_fkey foreign key (folder_id) references public.file_folders(id) on delete set null;

alter table if exists public.app_account_stock
  add constraint app_account_stock_app_id_fkey foreign key (app_id) references public.apps(id) on delete set null,
  add constraint app_account_stock_folder_file_id_fkey foreign key (folder_file_id) references public.uploaded_files(id) on delete set null;

insert into public.app_settings (id, site_name, site_logo_url, site_description, primary_color, accent_color)
values ('settings-main', 'SubGroup Manager', '', 'Private admin dashboard for shared subscriptions.', '#3b82f6', '#2563eb')
on conflict (id) do nothing;

insert into public.telegram_settings (
  id,
  bot_token,
  bot_token_encrypted,
  bot_token_hint,
  chat_id,
  chat_id_encrypted,
  chat_id_hint,
  reminder_days_before,
  reminder_days_before_expiry,
  enabled,
  default_message_template
)
values (
  'tg-1',
  '',
  '',
  '',
  '',
  '',
  '',
  3,
  3,
  false,
  'Reminder: {app_name} / {group_name}
Expiry: {expiry_date}
Paid: {paid_count}
Unpaid: {unpaid_count}'
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('admin-files', 'admin-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read admin files" on storage.objects;
drop policy if exists "Authenticated admins can upload admin files" on storage.objects;
drop policy if exists "Authenticated admins can update admin files" on storage.objects;
drop policy if exists "Authenticated admins can delete admin files" on storage.objects;

create policy "Public read admin files"
on storage.objects for select
using (bucket_id = 'admin-files');

create policy "Authenticated admins can upload admin files"
on storage.objects for insert to authenticated
with check (bucket_id = 'admin-files');

create policy "Authenticated admins can update admin files"
on storage.objects for update to authenticated
using (bucket_id = 'admin-files')
with check (bucket_id = 'admin-files');

create policy "Authenticated admins can delete admin files"
on storage.objects for delete to authenticated
using (bucket_id = 'admin-files');
