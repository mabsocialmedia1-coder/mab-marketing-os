create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('ceo','employee','client')),
  client_id text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_records (
  id text primary key,
  entity text not null check (entity in ('leads','media_assets','content_items','paid_campaigns','operative_tasks','activity_logs','tasks','calendar_events','work_journal','finances','chat_threads')),
  client_id text references public.clients(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_entries (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients(id) on delete cascade,
  event_key text not null,
  picked boolean not null default false,
  decision text check (decision in ('do','dont')),
  note text,
  sent_at timestamptz,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, event_key)
);

create table if not exists public.client_calendar_settings (
  client_id text primary key references public.clients(id) on delete cascade,
  calendar_layers jsonb not null default '{"jewish":true,"christian":true,"usLocal":true,"international":true,"events":true}'::jsonb,
  show_events boolean not null default true,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_entity_client_idx on public.app_records(entity, client_id);
create index if not exists plan_entries_client_idx on public.plan_entries(client_id);

insert into public.client_calendar_settings (client_id)
select id from public.clients on conflict (client_id) do nothing;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.employees enable row level security;
alter table public.app_records enable row level security;
alter table public.plan_entries enable row level security;
alter table public.client_calendar_settings enable row level security;

create or replace function public.current_profile_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.can_access_client(target_client_id text)
returns boolean language sql stable security definer set search_path = public
as $$ select auth.uid() is not null and (public.current_profile_role() in ('ceo','employee') or exists (select 1 from public.profiles p where p.id = auth.uid() and p.client_id = target_client_id)) $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_updated_at on public.profiles;
drop trigger if exists clients_updated_at on public.clients;
drop trigger if exists employees_updated_at on public.employees;
drop trigger if exists app_records_updated_at on public.app_records;
drop trigger if exists plan_entries_updated_at on public.plan_entries;
drop trigger if exists calendar_settings_updated_at on public.client_calendar_settings;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger clients_updated_at before update on public.clients for each row execute function public.touch_updated_at();
create trigger employees_updated_at before update on public.employees for each row execute function public.touch_updated_at();
create trigger app_records_updated_at before update on public.app_records for each row execute function public.touch_updated_at();
create trigger plan_entries_updated_at before update on public.plan_entries for each row execute function public.touch_updated_at();
create trigger calendar_settings_updated_at before update on public.client_calendar_settings for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email)) on conflict (id) do nothing; return new; end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Seed the app's current mock collections once. The application can upsert richer rows later.
insert into public.clients (id, name, data) values
('cf1','Aventura Realty','{"businessType":"Luxury Real Estate"}'::jsonb),
('cf2','Wynwood Gallery','{"businessType":"Art Gallery"}'::jsonb),
('cf3','Bright Smile Dental','{"businessType":"Dental Clinic"}'::jsonb)
on conflict (id) do nothing;

insert into public.client_calendar_settings (client_id) select id from public.clients on conflict (client_id) do nothing;

-- The app_records table is the durable home for every remaining collection from lib/data.ts.
-- Keep each original object under data to preserve the existing UI contract during migration.
comment on table public.app_records is 'Durable records for leads, media_assets, content_items, paid_campaigns, operative_tasks, activity_logs, tasks, calendar_events, work_journal, finances, and chat_threads';
comment on table public.plan_entries is 'Planning board decisions and notes per client/event';
comment on table public.client_calendar_settings is 'Enabled calendar layers per client';

-- Remove the anonymous seed helper function after setup if desired; it is protected by RLS in script 002.

-- Note: the FOR loop above is intentionally a no-op placeholder for readability; PostgreSQL accepts loops only in PL/pgSQL blocks, so it must not be executed as SQL.
-- The trigger statements above are the executable trigger definitions.
