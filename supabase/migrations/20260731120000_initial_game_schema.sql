-- TG(AI)F initial game schema
-- Safe to run once in the Supabase SQL Editor or through `supabase db push`.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.party_tasks (
  id smallint primary key check (id between 1 and 28),
  category text not null,
  title text not null,
  hint text,
  sort_order smallint not null unique,
  is_active boolean not null default true
);

create table if not exists public.completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id smallint not null references public.party_tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create index if not exists completions_user_id_idx
  on public.completions(user_id);

create index if not exists completions_completed_at_idx
  on public.completions(completed_at);

insert into public.party_tasks (id, category, title, hint, sort_order)
values
  (1, 'Arrive', 'Take a team selfie at the entrance.', 'Keep the photo as proof.', 1),
  (2, 'Arrive', 'Try the welcome drink.', null, 2),
  (3, 'Arrive', 'Add one song to the party playlist.', null, 3),
  (4, 'Arrive', 'Speak to one person from a different team.', null, 4),
  (5, 'Connect', 'Learn one Luganda word from a colleague.', null, 5),
  (6, 'Connect', 'Introduce two persons who do not know each other.', null, 6),
  (7, 'Connect', 'Find one person who started work this year.', null, 7),
  (8, 'Connect', 'Tell one person that you value their recent work.', null, 8),
  (9, 'Connect', 'Take a photo with one person who wears green.', null, 9),
  (10, 'Taste', 'Try one TGIF party food that you have not eaten before.', null, 10),
  (11, 'Taste', 'Share a plate of food with one person.', null, 11),
  (12, 'Taste', 'Vote for your favourite TGIF party snack.', null, 12),
  (13, 'Taste', 'Drink one full glass of water.', 'Water helps you stay hydrated.', 13),
  (14, 'Play', 'Win a TGIF party game, or cheer for another player.', null, 14),
  (15, 'Play', 'Start a dance with three persons.', null, 15),
  (16, 'Play', 'Use the official TG(AI)F pose for one photo.', null, 16),
  (17, 'Play', 'Make one person laugh.', null, 17),
  (18, 'Play', 'Teach one person a dance for five seconds.', null, 18),
  (19, 'Imagine', 'Give one idea for a more sustainable office.', null, 19),
  (20, 'Imagine', 'Draw a small bamboo pavilion.', null, 20),
  (21, 'Imagine', 'Name one bamboo building that you want to visit.', null, 21),
  (22, 'Imagine', 'Find three objects at the TGIF party that use natural materials.', null, 22),
  (23, 'Celebrate', 'Tell one person why you like working here.', null, 23),
  (24, 'Celebrate', 'Thank one TGIF party organiser.', null, 24),
  (25, 'Celebrate', 'Make a toast for one team achievement.', null, 25),
  (26, 'Celebrate', 'Take a photo of your plot.', null, 26),
  (27, 'Celebrate', 'Join the group photo.', null, 27),
  (28, 'Celebrate', 'Show your plot to one other player.', null, 28)
on conflict (id) do update set
  category = excluded.category,
  title = excluded.title,
  hint = excluded.hint,
  sort_order = excluded.sort_order,
  is_active = true;

alter table public.profiles enable row level security;
alter table public.party_tasks enable row level security;
alter table public.completions enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.party_tasks from anon, authenticated;
revoke all on table public.completions from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.party_tasks to anon, authenticated;
grant select, insert, delete on table public.completions to authenticated;

drop policy if exists "Public profiles are visible to everyone" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Active party tasks are public" on public.party_tasks;
create policy "Active party tasks are public"
  on public.party_tasks
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Users can view their own completions" on public.completions;
create policy "Users can view their own completions"
  on public.completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own completions" on public.completions;
create policy "Users can add their own completions"
  on public.completions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own completions" on public.completions;
create policy "Users can remove their own completions"
  on public.completions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Party Guest'
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    'Party Guest'
  ),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(users.raw_user_meta_data ->> 'picture', '')
  )
from auth.users as users
on conflict (id) do nothing;

drop view if exists public.leaderboard;
create view public.leaderboard
with (security_invoker = false, security_barrier = true)
as
select
  profiles.display_name,
  profiles.id = (select auth.uid()) as is_current_user,
  count(completions.task_id)::integer as completed_count
from public.profiles as profiles
left join public.completions
  on completions.user_id = profiles.id
group by profiles.id, profiles.display_name;

revoke all on table public.leaderboard from anon, authenticated;
grant select on table public.leaderboard to authenticated;
