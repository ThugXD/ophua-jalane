
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  job_title text not null default '',
  address text not null default '',
  primary_email text not null default '',
  secondary_email text not null default '',
  mobile_phone text not null default '',
  work_phone text not null default '',
  avatar_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Public read (the contact card is public)
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete using (auth.uid() = id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage buckets (public)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('covers', 'covers', true);

-- Storage policies: public read, owner write (path: <user_id>/...)
create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Cover images are publicly accessible"
  on storage.objects for select using (bucket_id = 'covers');

create policy "Users can upload their own cover"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own cover"
  on storage.objects for update
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own cover"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
