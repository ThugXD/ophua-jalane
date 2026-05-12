
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null,
  type text not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_unread_idx on public.notifications (recipient_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy "Recipients view their notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = recipient_id);

create policy "Recipients update their notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create policy "Recipients delete their notifications"
  on public.notifications for delete to authenticated
  using (auth.uid() = recipient_id);

alter publication supabase_realtime add table public.notifications;

create or replace function public.notify_admins(_type text, _title text, _body text, _metadata jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, type, title, body, metadata)
  select distinct uid, _type, _title, _body, _metadata
  from (
    select user_id as uid from public.user_roles where role = 'superadmin'
    union
    select admin_id as uid from public.groups where admin_id is not null
  ) admins
  where uid is not null;
end;
$$;

create or replace function public.notify_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_admins(
    'signup',
    'Novo registo',
    coalesce(nullif(NEW.full_name, ''), NEW.primary_email, 'Novo utilizador'),
    jsonb_build_object('user_id', NEW.id, 'email', NEW.primary_email)
  );
  return NEW;
end;
$$;

create trigger trg_notify_on_signup
after insert on public.profiles
for each row execute function public.notify_on_signup();

create or replace function public.notify_on_contact_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_admins(
    'contact_message',
    'Nova mensagem de contacto',
    coalesce(NEW.name, '') || ': ' || left(coalesce(NEW.message, ''), 120),
    jsonb_build_object('id', NEW.id, 'email', NEW.email, 'phone', NEW.phone)
  );
  return NEW;
end;
$$;

create trigger trg_notify_on_contact_message
after insert on public.contact_messages
for each row execute function public.notify_on_contact_message();
