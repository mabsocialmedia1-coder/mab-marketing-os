drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated using (id = auth.uid() or public.current_profile_role() in ('ceo','employee'));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid() or public.current_profile_role() = 'ceo') with check (id = auth.uid() or public.current_profile_role() = 'ceo');

drop policy if exists clients_select_allowed on public.clients;
create policy clients_select_allowed on public.clients for select to authenticated using (public.current_profile_role() in ('ceo','employee') or public.can_access_client(id));

drop policy if exists clients_manage_staff on public.clients;
create policy clients_manage_staff on public.clients for all to authenticated using (public.current_profile_role() in ('ceo','employee')) with check (public.current_profile_role() in ('ceo','employee'));

drop policy if exists employees_staff_read on public.employees;
create policy employees_staff_read on public.employees for select to authenticated using (public.current_profile_role() in ('ceo','employee'));

drop policy if exists employees_ceo_manage on public.employees;
create policy employees_ceo_manage on public.employees for all to authenticated using (public.current_profile_role() = 'ceo') with check (public.current_profile_role() = 'ceo');

drop policy if exists app_records_read_allowed on public.app_records;
create policy app_records_read_allowed on public.app_records for select to authenticated using (client_id is null or public.can_access_client(client_id));

drop policy if exists app_records_staff_manage on public.app_records;
create policy app_records_staff_manage on public.app_records for all to authenticated using (public.current_profile_role() in ('ceo','employee')) with check (public.current_profile_role() in ('ceo','employee'));

drop policy if exists plan_entries_read_allowed on public.plan_entries;
create policy plan_entries_read_allowed on public.plan_entries for select to authenticated using (public.can_access_client(client_id));

drop policy if exists plan_entries_staff_manage on public.plan_entries;
create policy plan_entries_staff_manage on public.plan_entries for all to authenticated using (public.current_profile_role() in ('ceo','employee')) with check (public.current_profile_role() in ('ceo','employee'));

drop policy if exists plan_entries_client_update on public.plan_entries;
create policy plan_entries_client_update on public.plan_entries for update to authenticated using (public.current_profile_role() = 'client' and sent_at is not null and public.can_access_client(client_id)) with check (public.current_profile_role() = 'client' and public.can_access_client(client_id));

drop policy if exists calendar_settings_read_allowed on public.client_calendar_settings;
create policy calendar_settings_read_allowed on public.client_calendar_settings for select to authenticated using (public.can_access_client(client_id));

drop policy if exists calendar_settings_staff_manage on public.client_calendar_settings;
create policy calendar_settings_staff_manage on public.client_calendar_settings for all to authenticated using (public.current_profile_role() in ('ceo','employee')) with check (public.current_profile_role() in ('ceo','employee'));

revoke all on public.profiles, public.clients, public.employees, public.app_records, public.plan_entries, public.client_calendar_settings from anon;
grant select, insert, update, delete on public.profiles, public.clients, public.employees, public.app_records, public.plan_entries, public.client_calendar_settings to authenticated;
revoke all on function public.current_profile_role() from public;
revoke all on function public.can_access_client(text) from public;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.can_access_client(text) to authenticated;
