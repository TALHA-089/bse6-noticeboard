-- Campus Notice Board Supabase schema, RLS policies, trigger, and realtime setup.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.notices (
  id int8 generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.notices enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "notices_select_public" on public.notices;
create policy "notices_select_public"
on public.notices
for select
to anon, authenticated
using (true);

drop policy if exists "notices_insert_own" on public.notices;
create policy "notices_insert_own"
on public.notices
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notices_delete_own" on public.notices;
create policy "notices_delete_own"
on public.notices
for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter publication supabase_realtime add table public.notices;
