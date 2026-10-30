-- Prevent authenticated users from changing their own authorization fields.
-- Server/dashboard edits without an authenticated Supabase user remain allowed.
create or replace function public.protect_profile_authorization_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and auth.uid() = old.id
     and public.current_profile_role() <> 'ceo'
     and (new.role is distinct from old.role or new.client_id is distinct from old.client_id) then
    raise exception 'Only a ceo can change profile role or client assignment';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_authorization_fields on public.profiles;
create trigger protect_profile_authorization_fields
before update on public.profiles
for each row
execute function public.protect_profile_authorization_fields();

-- Replace app_records policies so null-client records are staff-only and
-- finance records are restricted to ceo for both reads and writes.
drop policy if exists app_records_read_allowed on public.app_records;
drop policy if exists app_records_staff_manage on public.app_records;
drop policy if exists app_records_finance_ceo_read on public.app_records;
drop policy if exists app_records_finance_ceo_manage on public.app_records;

create policy app_records_read_allowed
on public.app_records
for select
to authenticated
using (
  entity <> 'finances'
  and (
    (client_id is null and public.current_profile_role() in ('ceo', 'employee'))
    or (client_id is not null and public.can_access_client(client_id))
  )
);

create policy app_records_staff_manage
on public.app_records
for all
to authenticated
using (
  entity <> 'finances'
  and public.current_profile_role() in ('ceo', 'employee')
  and (
    (client_id is null and public.current_profile_role() in ('ceo', 'employee'))
    or (client_id is not null and public.can_access_client(client_id))
  )
)
with check (
  entity <> 'finances'
  and public.current_profile_role() in ('ceo', 'employee')
  and (
    (client_id is null and public.current_profile_role() in ('ceo', 'employee'))
    or (client_id is not null and public.can_access_client(client_id))
  )
);

create policy app_records_finance_ceo_read
on public.app_records
for select
to authenticated
using (
  entity = 'finances'
  and public.current_profile_role() = 'ceo'
);

create policy app_records_finance_ceo_manage
on public.app_records
for all
to authenticated
using (
  entity = 'finances'
  and public.current_profile_role() = 'ceo'
)
with check (
  entity = 'finances'
  and public.current_profile_role() = 'ceo'
); 

revoke all on function public.protect_profile_authorization_fields() from public;
grant execute on function public.protect_profile_authorization_fields() to authenticated;
