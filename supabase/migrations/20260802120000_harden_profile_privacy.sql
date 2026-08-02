-- Restrict identity data to the minimum needed by signed-in players.

begin;

revoke all on table public.profiles from anon;
revoke insert, update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Public profiles are visible to everyone" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop view if exists public.leaderboard;
create view public.leaderboard
with (security_invoker = false, security_barrier = true)
as
select
  profiles.display_name,
  profiles.id = (select auth.uid()) as is_current_user,
  count(completions.task_id)::integer as completed_count
from public.profiles as profiles
left join public.completions as completions
  on completions.user_id = profiles.id
group by profiles.id, profiles.display_name;

revoke all on table public.leaderboard from public, anon, authenticated;
grant select on table public.leaderboard to authenticated;

comment on view public.leaderboard is
  'Signed-in leaderboard without auth user IDs, avatars, or activity timestamps.';

commit;
