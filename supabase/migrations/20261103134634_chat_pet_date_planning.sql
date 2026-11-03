begin;

create table public.chat_messages (
  id uuid primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000 and body !~ '^[[:space:]]*$'),
  created_at timestamptz not null default now()
);
create index chat_messages_history on public.chat_messages(couple_id,created_at desc,id desc);
create index chat_messages_author_time on public.chat_messages(author_id,created_at desc);
alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from public,anon,authenticated;
grant select on public.chat_messages to authenticated;
create policy read_our_chat on public.chat_messages for select to authenticated using (couple_id = (select private.current_couple_id()));

create function private.send_chat_message(message_id uuid, message_body text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); cid uuid := private.current_couple_id(); existing public.chat_messages%rowtype;
begin
  if uid is null or not private.pair_ready() then raise exception 'Connect your partner before chatting.'; end if;
  if message_id is null or message_body is null or length(btrim(message_body)) not between 1 and 2000 or message_body ~ '^[[:space:]]*$' then raise exception 'Write a message of up to 2000 characters.'; end if;
  perform 1 from public.profiles where id = uid for update;
  select * into existing from public.chat_messages where id = message_id;
  if found then
    if existing.couple_id <> cid or existing.author_id <> uid or existing.body <> btrim(message_body) then raise exception 'This message identifier is already used.'; end if;
    return to_jsonb(existing);
  end if;
  if (select count(*) from public.chat_messages where author_id = uid and created_at > now() - interval '1 minute') >= 60 then raise exception 'A little too fast. Wait a minute before sending more.'; end if;
  insert into public.chat_messages(id,couple_id,author_id,body) values(message_id,cid,uid,btrim(message_body)) returning * into existing;
  return to_jsonb(existing);
end;
$$;
create function public.send_chat_message(message_id uuid,message_body text) returns jsonb language sql security invoker set search_path = '' as $$ select private.send_chat_message(message_id,message_body); $$;

create table public.pets (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 24 and name !~ '^[[:space:]]*$'),
  kind text not null check (kind in ('bear','cat','dog','bunny')),
  care_points integer not null default 0 check (care_points between 0 and 1000000000),
  adopted_at timestamptz not null default now()
);
create table public.pet_care (
  couple_id uuid not null references public.pets(couple_id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  action text not null check (action in ('feed','play','rest')),
  created_at timestamptz not null default now(),
  primary key(couple_id,author_id,day,action)
);
create index pet_care_author on public.pet_care(author_id);
create index pet_care_history on public.pet_care(couple_id,day desc);
alter table public.pets enable row level security;
alter table public.pet_care enable row level security;
revoke all on public.pets,public.pet_care from public,anon,authenticated;
grant select on public.pets,public.pet_care to authenticated;
create policy read_our_pet on public.pets for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy read_our_care on public.pet_care for select to authenticated using (couple_id = (select private.current_couple_id()));

create function private.adopt_pet(pet_name text,pet_kind text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); result public.pets%rowtype;
begin
  if auth.uid() is null or not private.pair_ready() then raise exception 'Connect your partner before adopting.'; end if;
  perform 1 from public.couples where id = cid for update;
  if exists(select 1 from public.pets where couple_id = cid) then raise exception 'Your shared pet has already been adopted.'; end if;
  insert into public.pets(couple_id,name,kind) values(cid,btrim(pet_name),pet_kind) returning * into result;
  return to_jsonb(result);
end;
$$;
create function public.adopt_pet(pet_name text,pet_kind text) returns jsonb language sql security invoker set search_path = '' as $$ select private.adopt_pet(pet_name,pet_kind); $$;

create function private.care_for_pet(care_action text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); uid uuid := auth.uid(); result public.pets%rowtype; added integer;
begin
  if uid is null or not private.pair_ready() then raise exception 'Connect your partner first.'; end if;
  if coalesce(care_action,'') not in ('feed','play','rest') then raise exception 'Choose feed, play, or tuck in.'; end if;
  select * into result from public.pets where couple_id = cid for update;
  if not found then raise exception 'Adopt your shared pet first.'; end if;
  insert into public.pet_care(couple_id,author_id,day,action) values(cid,uid,private.couple_today(),care_action) on conflict do nothing;
  get diagnostics added = row_count;
  if added = 1 then update public.pets set care_points = care_points + 5 where couple_id = cid returning * into result; end if;
  return to_jsonb(result);
end;
$$;
create function public.care_for_pet(care_action text) returns jsonb language sql security invoker set search_path = '' as $$ select private.care_for_pet(care_action); $$;

create function private.rename_pet(pet_name text) returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.pair_ready() then raise exception 'Connect your partner first.'; end if;
  update public.pets set name = btrim(pet_name) where couple_id = private.current_couple_id();
  if not found then raise exception 'Adopt your shared pet first.'; end if;
end;
$$;
create function public.rename_pet(pet_name text) returns void language sql security invoker set search_path = '' as $$ select private.rename_pet(pet_name); $$;

alter table public.plans
  add column planned_time text not null default '' check (planned_time = '' or planned_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  add column place text not null default '' check (length(place) <= 180),
  add column notes text not null default '' check (length(notes) <= 500),
  add column format text not null default 'in-person' check (format in ('in-person','virtual')),
  add column accepted_by uuid[] not null default '{}' check (cardinality(accepted_by) <= 2),
  add column revision integer not null default 1 check (revision > 0);
-- Older clients may still create basic plans; they cannot forge confirmations.
revoke insert on public.plans from authenticated;
grant insert(couple_id,author_id,title,kind,planned_on) on public.plans to authenticated;

create function private.save_plan(plan_id uuid,draft jsonb,expected_revision integer default null) returns jsonb language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); uid uuid := auth.uid(); result public.plans%rowtype;
  plan_title text := btrim(draft->>'title'); plan_kind text := draft->>'kind'; plan_format text := draft->>'format';
  plan_date date; plan_time text := coalesce(draft->>'time',''); plan_place text := btrim(coalesce(draft->>'place','')); plan_notes text := btrim(coalesce(draft->>'notes',''));
begin
  if uid is null or not private.pair_ready() then raise exception 'Connect your partner before making plans.'; end if;
  if jsonb_typeof(draft) <> 'object' or plan_title is null or length(plan_title) not between 1 and 120 or plan_title ~ '^[[:space:]]*$' then raise exception 'Give your plan a title of up to 120 characters.'; end if;
  if coalesce(plan_kind,'') not in ('date','wish') or coalesce(plan_format,'') not in ('in-person','virtual') then raise exception 'Choose a date type.'; end if;
  if length(plan_place) > 180 or length(plan_notes) > 500 then raise exception 'The place or notes are too long.'; end if;
  if plan_kind = 'date' then
    if coalesce(draft->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Use a date in YYYY-MM-DD format.'; end if;
    plan_date := (draft->>'date')::date;
    if plan_date < private.couple_today() then raise exception 'Choose today or a future date.'; end if;
    if plan_time <> '' and plan_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Use a time from 00:00 to 23:59.'; end if;
  else plan_date := null; plan_time := ''; end if;
  if plan_id is null then
    insert into public.plans(couple_id,author_id,title,kind,planned_on,planned_time,place,notes,format,accepted_by)
    values(cid,uid,plan_title,plan_kind,plan_date,plan_time,plan_place,plan_notes,plan_format,case when plan_kind = 'date' then array[uid] else '{}'::uuid[] end) returning * into result;
  else
    select * into result from public.plans where id = plan_id and couple_id = cid for update;
    if not found then raise exception 'This plan is not in your space.'; end if;
    if expected_revision is distinct from result.revision then raise exception 'This plan changed. Refresh and review it before saving.'; end if;
    update public.plans set title = plan_title,kind = plan_kind,planned_on = plan_date,planned_time = plan_time,place = plan_place,notes = plan_notes,format = plan_format,
      accepted_by = case when plan_kind = 'date' then array[uid] else '{}'::uuid[] end, revision = revision + 1,done = false where id = plan_id returning * into result;
  end if;
  return to_jsonb(result);
end;
$$;
create function public.save_plan(plan_id uuid,draft jsonb,expected_revision integer default null) returns jsonb language sql security invoker set search_path = '' as $$ select private.save_plan(plan_id,draft,expected_revision); $$;

create function private.respond_to_plan(plan_id uuid,going boolean,expected_revision integer) returns jsonb language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); uid uuid := auth.uid(); result public.plans%rowtype;
begin
  if uid is null or not private.pair_ready() or going is null then raise exception 'Connect your partner first.'; end if;
  select * into result from public.plans where id = plan_id and couple_id = cid for update;
  if not found then raise exception 'This plan is not in your space.'; end if;
  if expected_revision is distinct from result.revision then raise exception 'This plan changed. Refresh and review it before confirming.'; end if;
  if result.kind <> 'date' or result.done then raise exception 'Choose an upcoming date.'; end if;
  update public.plans set accepted_by = case when going then array_append(array_remove(accepted_by,uid),uid) else array_remove(accepted_by,uid) end where id = plan_id returning * into result;
  return to_jsonb(result);
end;
$$;
create function public.respond_to_plan(plan_id uuid,going boolean,expected_revision integer) returns jsonb language sql security invoker set search_path = '' as $$ select private.respond_to_plan(plan_id,going,expected_revision); $$;

revoke all on function private.send_chat_message(uuid,text),private.adopt_pet(text,text),private.care_for_pet(text),private.rename_pet(text),private.save_plan(uuid,jsonb,integer),private.respond_to_plan(uuid,boolean,integer) from public,anon,authenticated;
revoke all on function public.send_chat_message(uuid,text),public.adopt_pet(text,text),public.care_for_pet(text),public.rename_pet(text),public.save_plan(uuid,jsonb,integer),public.respond_to_plan(uuid,boolean,integer) from public,anon,authenticated;
grant execute on function private.send_chat_message(uuid,text),private.adopt_pet(text,text),private.care_for_pet(text),private.rename_pet(text),private.save_plan(uuid,jsonb,integer),private.respond_to_plan(uuid,boolean,integer) to authenticated;
grant execute on function public.send_chat_message(uuid,text),public.adopt_pet(text,text),public.care_for_pet(text),public.rename_pet(text),public.save_plan(uuid,jsonb,integer),public.respond_to_plan(uuid,boolean,integer) to authenticated;
alter publication supabase_realtime add table public.chat_messages,public.pets,public.pet_care;
notify pgrst,'reload schema';
commit;
