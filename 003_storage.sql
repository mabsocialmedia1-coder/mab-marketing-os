insert into storage.buckets (id, name, public)
values ('mab-media', 'mab-media', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "mab media read allowed" on storage.objects;
drop policy if exists "mab media upload staff" on storage.objects;
drop policy if exists "mab media update staff" on storage.objects;
drop policy if exists "mab media delete staff" on storage.objects;
create policy "mab media read allowed" on storage.objects for select to authenticated using (bucket_id = 'mab-media' and (public.can_access_client((storage.foldername(name))[1]) or public.current_profile_role() in ('ceo','employee')));
create policy "mab media upload staff" on storage.objects for insert to authenticated with check (bucket_id = 'mab-media' and public.current_profile_role() in ('ceo','employee'));
create policy "mab media update staff" on storage.objects for update to authenticated using (bucket_id = 'mab-media' and public.current_profile_role() in ('ceo','employee')) with check (bucket_id = 'mab-media' and public.current_profile_role() in ('ceo','employee'));
create policy "mab media delete staff" on storage.objects for delete to authenticated using (bucket_id = 'mab-media' and public.current_profile_role() in ('ceo','employee'));
