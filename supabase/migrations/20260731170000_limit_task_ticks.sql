-- Limit each task to five users and expose safe aggregate counts.

create or replace function public.enforce_task_tick_limit()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  affected_task_id smallint;
  current_tick_count integer;
begin
  affected_task_id :=
    case when tg_op = 'DELETE' then old.task_id else new.task_id end;

  perform pg_catalog.pg_advisory_xact_lock(84217, affected_task_id::integer);

  if tg_op = 'INSERT' then
    select count(*)::integer
      into current_tick_count
      from public.completions
      where task_id = affected_task_id;

    if current_tick_count >= 5 then
      raise exception using
        errcode = 'P0001',
        message = 'task_full';
    end if;

    return new;
  end if;

  return old;
end;
$$;

revoke execute on function public.enforce_task_tick_limit()
  from public, anon, authenticated;

drop trigger if exists enforce_task_tick_limit
  on public.completions;

create trigger enforce_task_tick_limit
  before insert or delete on public.completions
  for each row execute procedure public.enforce_task_tick_limit();

drop view if exists public.task_completion_counts;
create view public.task_completion_counts
with (security_invoker = false)
as
select
  party_tasks.id as task_id,
  count(completions.user_id)::integer as completion_count
from public.party_tasks as party_tasks
left join public.completions as completions
  on completions.task_id = party_tasks.id
where party_tasks.is_active = true
group by party_tasks.id;

revoke all on table public.task_completion_counts from anon, authenticated;
grant select on table public.task_completion_counts to authenticated;
