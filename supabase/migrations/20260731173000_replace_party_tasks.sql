-- Replace the original 28 tasks with the 101-task TG(AI)F list.
-- Existing ticks are cleared once because the task IDs now have new meanings.

begin;

do $$
begin
  if not exists (
    select 1
    from public.party_tasks
    where id = 101
      and title = 'End the night by telling someone, "My forest has grown."'
  ) then
    delete from public.completions;
  end if;
end;
$$;

alter table public.party_tasks
  drop constraint if exists party_tasks_id_check;

alter table public.party_tasks
  add constraint party_tasks_id_check check (id between 1 and 101);

insert into public.party_tasks (id, category, title, hint, sort_order, is_active)
values
  (1, 'A. Arrival, greetings, and social sneaking', 'Arrive and greet someone with unnecessary enthusiasm.', null, 1, true),
  (2, 'A. Arrival, greetings, and social sneaking', 'Say "Happy TG(AI)F" to someone who was not ready for it.', null, 2, true),
  (3, 'A. Arrival, greetings, and social sneaking', 'Ask someone how their week was and actually listen.', null, 3, true),
  (4, 'A. Arrival, greetings, and social sneaking', 'Secretly learn one new thing about a colleague.', null, 4, true),
  (5, 'A. Arrival, greetings, and social sneaking', 'Genuinely compliment someone''s outfit, shoes, hair, bag, or general vibe.', null, 5, true),
  (6, 'A. Arrival, greetings, and social sneaking', 'Shake someone''s hand like you are closing a major construction contract.', null, 6, true),
  (7, 'A. Arrival, greetings, and social sneaking', 'Give someone a nickname for the evening.', null, 7, true),
  (8, 'A. Arrival, greetings, and social sneaking', 'Get someone to laugh within 30 seconds of starting a conversation.', null, 8, true),
  (9, 'A. Arrival, greetings, and social sneaking', 'Introduce yourself to someone you do not usually talk to.', null, 9, true),
  (10, 'A. Arrival, greetings, and social sneaking', 'Join a conversation, say one useful thing, and disappear right there and then.', null, 10, true),
  (11, 'B. Secret mischief, but harmless', 'Say "this needs coordination" about something completely unrelated to work.', null, 11, true),
  (12, 'B. Secret mischief, but harmless', 'Ask "who approved this?" while looking at snacks or drinks.', null, 12, true),
  (13, 'B. Secret mischief, but harmless', 'Tell someone "we need a site meeting" about the food table.', null, 13, true),
  (14, 'B. Secret mischief, but harmless', 'Use the word "deliverable" in a normal social conversation.', null, 14, true),
  (15, 'B. Secret mischief, but harmless', 'Use the word "bamboo" three times without explaining why.', null, 15, true),
  (16, 'B. Secret mischief, but harmless', 'Pretend to inspect a chair before sitting on it.', null, 16, true),
  (17, 'B. Secret mischief, but harmless', 'Announce that the music has passed structural review.', null, 17, true),
  (18, 'B. Secret mischief, but harmless', 'Say "we shall revert" and then walk away.', null, 18, true),
  (19, 'B. Secret mischief, but harmless', 'Secretly start a rumour that someone is winning the bamboo forest.', null, 19, true),
  (20, 'B. Secret mischief, but harmless', 'Ask someone if their drink has been approved by QA/QC.', null, 20, true),
  (21, 'C. Food and drink challenges', 'Drink one bottle of beer.', null, 21, true),
  (22, 'C. Food and drink challenges', 'Drink two bottles of beer.', null, 22, true),
  (23, 'C. Food and drink challenges', 'Drink three bottles of beer.', null, 23, true),
  (24, 'C. Food and drink challenges', 'Drink four bottles of beer.', null, 24, true),
  (25, 'C. Food and drink challenges', 'Drink five bottles of beer, responsibly, with water and food.', null, 25, true),
  (26, 'C. Food and drink challenges', 'Drink no alcohol at all and still have maximum vibes.', null, 26, true),
  (27, 'C. Food and drink challenges', 'Drink only soda or juice the whole time.', null, 27, true),
  (28, 'C. Food and drink challenges', 'Drink a full glass of water between drinks.', null, 28, true),
  (29, 'C. Food and drink challenges', 'Convince someone else to drink water.', null, 29, true),
  (30, 'C. Food and drink challenges', 'Eat something and describe it like a professional food critic.', null, 30, true),
  (31, 'C. Food and drink challenges', 'Recommend a snack to someone with full confidence.', null, 31, true),
  (32, 'C. Food and drink challenges', 'Say "this food is a project success."', null, 32, true),
  (33, 'C. Food and drink challenges', 'Hold a drink dramatically while giving advice.', null, 33, true),
  (34, 'C. Food and drink challenges', 'Finish the night hydrated.', null, 34, true),
  (35, 'D. Conversation missions', 'Ask someone what they would do if they had a free one-acre plot.', null, 35, true),
  (36, 'D. Conversation missions', 'Ask someone what their bamboo forest would be called.', null, 36, true),
  (37, 'D. Conversation missions', 'Ask someone what their hidden talent is.', null, 37, true),
  (38, 'D. Conversation missions', 'Ask someone for their most harmless office confession.', null, 38, true),
  (39, 'D. Conversation missions', 'Ask someone what song describes their week.', null, 39, true),
  (40, 'D. Conversation missions', 'Ask someone what they would ban from meetings forever.', null, 40, true),
  (41, 'D. Conversation missions', 'Ask someone what they would add to every TGIF.', null, 41, true),
  (42, 'D. Conversation missions', 'Ask someone what job they would do if Localworks did not exist.', null, 42, true),
  (43, 'D. Conversation missions', 'Ask someone which Localworks project has the best vibes.', null, 43, true),
  (44, 'D. Conversation missions', 'Ask someone to explain their work badly on purpose.', null, 44, true),
  (45, 'E. Games, competition, and small victories', 'Beat someone at foosball.', null, 45, true),
  (46, 'E. Games, competition, and small victories', 'Lose at foosball and blame "poor site conditions."', null, 46, true),
  (47, 'E. Games, competition, and small victories', 'Score one foosball goal and celebrate like Uganda won the World Cup.', null, 47, true),
  (48, 'E. Games, competition, and small victories', 'Challenge someone to rock-paper-scissors.', null, 48, true),
  (49, 'E. Games, competition, and small victories', 'Win rock-paper-scissors.', null, 49, true),
  (50, 'E. Games, competition, and small victories', 'Lose rock-paper-scissors and demand a rematch.', null, 50, true),
  (51, 'E. Games, competition, and small victories', 'Start a clap rhythm and get at least two people to join.', null, 51, true),
  (52, 'E. Games, competition, and small victories', 'Dance for at least 10 seconds.', null, 52, true),
  (53, 'E. Games, competition, and small victories', 'Dance while seated.', null, 53, true),
  (54, 'E. Games, competition, and small victories', 'Make someone dance who claimed they do not dance.', null, 54, true),
  (55, 'E. Games, competition, and small victories', 'Start a mini chant for someone.', null, 55, true),
  (56, 'E. Games, competition, and small victories', 'Quietly copy someone''s dance move.', null, 56, true),
  (57, 'E. Games, competition, and small victories', 'Do a victory pose after completing any activity.', null, 57, true),
  (58, 'E. Games, competition, and small victories', 'Celebrate someone else''s small win loudly.', null, 58, true),
  (59, 'E. Games, competition, and small victories', 'Declare yourself temporarily unbeatable at something.', null, 59, true),
  (60, 'F. MC, speaker, and room interaction', 'Interrupt the MC politely with a funny comment.', null, 60, true),
  (61, 'F. MC, speaker, and room interaction', 'Ask the MC a completely unnecessary question.', null, 61, true),
  (62, 'F. MC, speaker, and room interaction', 'Cheer for a speaker before they start.', null, 62, true),
  (63, 'F. MC, speaker, and room interaction', 'Say "point of information" during a casual moment.', null, 63, true),
  (64, 'F. MC, speaker, and room interaction', 'Ask someone to "take minutes" of a funny conversation.', null, 64, true),
  (65, 'F. MC, speaker, and room interaction', 'Clap as if a major contract has just been awarded.', null, 65, true),
  (66, 'F. MC, speaker, and room interaction', 'Ask for a vote on something silly.', null, 66, true),
  (67, 'F. MC, speaker, and room interaction', 'Nominate someone as Minister of Vibes.', null, 67, true),
  (68, 'F. MC, speaker, and room interaction', 'Give someone a fake award title.', null, 68, true),
  (69, 'F. MC, speaker, and room interaction', 'Whisper "this is going in the report" after something funny happens.', null, 69, true),
  (70, 'G. Localworks-flavoured fun', 'Mention bamboo in a conversation where it does not belong.', null, 70, true),
  (71, 'G. Localworks-flavoured fun', 'Describe your drink as a "locally sourced material."', null, 71, true),
  (72, 'G. Localworks-flavoured fun', 'Call the snack table a "mixed-use development."', null, 72, true),
  (73, 'G. Localworks-flavoured fun', 'Refer to the dance floor as "public realm."', null, 73, true),
  (74, 'G. Localworks-flavoured fun', 'Say a chair has "good structural integrity."', null, 74, true),
  (75, 'G. Localworks-flavoured fun', 'Tell someone their outfit has "excellent detailing."', null, 75, true),
  (76, 'G. Localworks-flavoured fun', 'Describe someone''s laugh as "good acoustic performance."', null, 76, true),
  (77, 'G. Localworks-flavoured fun', 'Call a group of people a "cluster development."', null, 77, true),
  (78, 'G. Localworks-flavoured fun', 'Say your bamboo forest is "low carbon and high vibes."', null, 78, true),
  (79, 'G. Localworks-flavoured fun', 'Explain your mood using an engineering or architectural term.', null, 79, true),
  (80, 'G. Localworks-flavoured fun', 'Say "I am just here for the bamboo" with a straight face.', null, 80, true),
  (81, 'G. Localworks-flavoured fun', 'Invent a fake Localworks department.', null, 81, true),
  (82, 'H. Secret identity and bragging missions', 'Name your bamboo forest.', null, 82, true),
  (83, 'H. Secret identity and bragging missions', 'Tell someone your bamboo forest is growing faster than theirs.', null, 83, true),
  (84, 'H. Secret identity and bragging missions', 'Form a secret bamboo alliance with one person.', null, 84, true),
  (85, 'H. Secret identity and bragging missions', 'Betray your bamboo alliance politely.', null, 85, true),
  (86, 'H. Secret identity and bragging missions', 'Tell someone you are "not here to compete" while clearly competing.', null, 86, true),
  (87, 'H. Secret identity and bragging missions', 'Quietly check your bamboo count and smile suspiciously.', null, 87, true),
  (88, 'H. Secret identity and bragging missions', 'Accuse someone of having illegal bamboo.', null, 88, true),
  (89, 'H. Secret identity and bragging missions', 'Declare yourself the most fun person in the room, privately or publicly.', null, 89, true),
  (90, 'H. Secret identity and bragging missions', 'Create a fake campaign slogan for your bamboo forest.', null, 90, true),
  (91, 'H. Secret identity and bragging missions', 'Secretly complete 10 activities before anyone notices.', null, 91, true),
  (92, 'I. Funny personal dares', 'Speak in a serious meeting voice for one full minute.', null, 92, true),
  (93, 'I. Funny personal dares', 'Speak in a fake radio presenter voice for one sentence.', null, 93, true),
  (94, 'I. Funny personal dares', 'Use a proverb badly but confidently.', null, 94, true),
  (95, 'I. Funny personal dares', 'Say "as per my last bamboo" in conversation.', null, 95, true),
  (96, 'I. Funny personal dares', 'Laugh at a joke you did not fully hear.', null, 96, true),
  (97, 'I. Funny personal dares', 'Pretend to understand a story, then ask one unrelated question but make it seem like it comes from the story''s context.', null, 97, true),
  (98, 'I. Funny personal dares', 'Give life advice that sounds wise but means almost nothing.', null, 98, true),
  (99, 'I. Funny personal dares', 'Say "I was young then" about something that happened last week.', null, 99, true),
  (100, 'I. Funny personal dares', 'Make a dramatic entrance or exit.', null, 100, true),
  (101, 'I. Funny personal dares', 'End the night by telling someone, "My forest has grown."', null, 101, true)
on conflict (id) do update set
  category = excluded.category,
  title = excluded.title,
  hint = excluded.hint,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

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

commit;
