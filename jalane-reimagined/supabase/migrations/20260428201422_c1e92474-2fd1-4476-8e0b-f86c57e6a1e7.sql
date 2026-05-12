
-- Fix function search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- handle_new_user must remain SECURITY DEFINER (writes to public.profiles from auth trigger),
-- but restrict EXECUTE so only the trigger context (postgres/supabase_auth_admin) can run it.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Restrict avatars/covers SELECT to owner-folder listings only.
-- Public READ still works via the public bucket URLs (no auth needed for direct file access).
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Cover images are publicly accessible" on storage.objects;

create policy "Users can list their own avatar files"
  on storage.objects for select
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can list their own cover files"
  on storage.objects for select
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
