begin;

create table public.mood_entries (
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  mood text not null check (mood in ('happy','loved','calm','low','stressed','missing','space')),
  updated_at timestamptz not null default now(),
  primary key(couple_id,author_id,day)
);
create index mood_entries_author on public.mood_entries(author_id);
alter table public.mood_entries enable row level security;
revoke all on public.mood_entries from public,anon,authenticated;
grant select on public.mood_entries to authenticated;
create policy read_our_moods on public.mood_entries for select to authenticated
  using (couple_id = (select private.current_couple_id()));

-- The server owns identity, timestamps and the couple's calendar boundary.
-- Notes and support requests remain on the current profile, not in this history.
create function private.log_mood(feeling text, note text default '', support text default '')
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); cid uuid := private.current_couple_id();
begin
  if uid is null then raise exception 'Sign in to share your mood.'; end if;
  if feeling is null or feeling not in ('happy','loved','calm','low','stressed','missing','space') then raise exception 'Choose one of the available moods.'; end if;
  if note is null or length(note) > 200 then raise exception 'Keep your mood note under 200 characters.'; end if;
  if support is null or support not in ('','A hug','Just listen','Something fun','Quiet time','Nothing right now') then raise exception 'Choose one of the available support options.'; end if;
  update public.profiles set mood = feeling, mood_note = btrim(note), need = support, mood_updated_at = now() where id = uid;
  if not found then raise exception 'Your profile could not be found.'; end if;
  if cid is not null then
    insert into public.mood_entries(couple_id,author_id,day,mood)
      values(cid,uid,private.couple_today(),feeling)
      on conflict(couple_id,author_id,day) do update set mood = excluded.mood, updated_at = now();
  end if;
end;
$$;
create function public.log_mood(feeling text, note text default '', support text default '')
returns void language sql security invoker set search_path = '' as $$ select private.log_mood(feeling,note,support); $$;

-- Return a small display window, but calculate the streak over the full history.
create function public.get_mood_history() returns jsonb language sql stable security invoker set search_path = '' as $$
  with boundary as (select private.couple_today() as today, private.current_couple_id() as cid),
  history as (
    select m.* from public.mood_entries m, boundary b where m.couple_id = b.cid and m.day <= b.today
  ), ranked as (
    select author_id,day,day + (row_number() over(partition by author_id order by day desc))::integer as run from history
  ), runs as (
    select author_id,max(day) as last_day,count(*) as days from ranked group by author_id,run
  )
  select jsonb_build_object(
    'entries',coalesce((select jsonb_agg(jsonb_build_object('authorId',author_id,'day',day,'mood',mood,'updatedAt',updated_at) order by day desc,author_id) from history,boundary where day >= today - 29),'[]'::jsonb),
    'streaks',coalesce((select jsonb_agg(jsonb_build_object('authorId',author_id,'days',days,'lastDay',last_day)) from runs,boundary where last_day >= today - 1),'[]'::jsonb)
  );
$$;

revoke all on function private.log_mood(text,text,text),public.log_mood(text,text,text),public.get_mood_history() from public,anon,authenticated;
grant execute on function private.log_mood(text,text,text),public.log_mood(text,text,text),public.get_mood_history() to authenticated;

create index moments_recent_photos on public.moments(couple_id,created_at desc,id desc) where kind = 'photo';
alter publication supabase_realtime add table public.mood_entries;

commit;
