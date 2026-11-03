-- Closer alpha: private spaces for exactly two authenticated people.
-- Apply to a fresh Supabase project. No service key is shipped to clients.
begin;
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) between 1 and 30),
  mood text not null default 'calm' check (mood in ('happy','loved','calm','low','stressed','missing','space')),
  mood_note text not null default '' check (length(mood_note) <= 200),
  need text not null default '' check (need in ('','A hug','Just listen','Something fun','Quiet time','Nothing right now')),
  mood_updated_at timestamptz not null default now()
);
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  started_on date not null default current_date,
  mode text not null default 'nearby' check (mode in ('nearby','distance')),
  time_zone text not null default 'UTC',
  created_at timestamptz not null default now()
);
create table public.couple_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  seat smallint not null check (seat in (1,2)),
  unique(couple_id, seat)
);
create table public.pair_invites (
  code_hash bytea primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index pair_invites_couple on public.pair_invites(couple_id);
create table public.pair_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index pair_attempts_user on public.pair_attempts(user_id, attempted_at);

create function private.current_couple_id() returns uuid language sql stable security definer set search_path = '' as $$
  select couple_id from public.couple_members where user_id = (select auth.uid());
$$;
create function private.pair_ready() returns boolean language sql stable security definer set search_path = '' as $$
  select count(*) = 2 from public.couple_members where couple_id = private.current_couple_id();
$$;
create function private.couple_today() returns date language sql stable security definer set search_path = '' as $$
  select (now() at time zone time_zone)::date from public.couples where id = private.current_couple_id();
$$;
create function private.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),30),''),'You'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.create_profile();

create function public.valid_stroke(s jsonb) returns boolean language plpgsql immutable set search_path = '' as $$
declare p jsonb;
begin
  if s is null or jsonb_typeof(s) <> 'object' or pg_column_size(s) > 100000 then return false; end if;
  if not (s ?& array['id','authorId','color','width','points']) then return false; end if;
  if jsonb_typeof(s->'id') <> 'string' or jsonb_typeof(s->'authorId') <> 'string' or jsonb_typeof(s->'color') <> 'string' or jsonb_typeof(s->'width') <> 'number' then return false; end if;
  if (s->>'color') !~ '^#[0-9A-Fa-f]{6}$' or (s->>'width') not in ('3','7','13') then return false; end if;
  if jsonb_typeof(s->'points') <> 'array' then return false; end if;
  if jsonb_array_length(s->'points') not between 1 and 3000 then return false; end if;
  for p in select value from jsonb_array_elements(s->'points') loop
    if jsonb_typeof(p) <> 'array' then return false; end if;
    if jsonb_array_length(p) <> 2 or jsonb_typeof(p->0) <> 'number' or jsonb_typeof(p->1) <> 'number' then return false; end if;
    if (p->>0)::numeric not between 0 and 321 or (p->>1)::numeric not between 0 and 321 then return false; end if;
  end loop;
  return true;
end;
$$;
create function public.valid_drawing(d jsonb) returns boolean language plpgsql immutable set search_path = '' as $$
declare s jsonb;
begin
  if d is null then return true; end if;
  if jsonb_typeof(d) <> 'array' or pg_column_size(d) > 2000000 then return false; end if;
  if jsonb_array_length(d) not between 1 and 500 then return false; end if;
  for s in select value from jsonb_array_elements(d) loop
    if not public.valid_stroke(s) then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.moments (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('note','photo','hug','drawing')),
  body text not null default '' check (length(body) <= 500),
  photo_path text,
  drawing jsonb check (public.valid_drawing(drawing)),
  created_at timestamptz not null default now(),
  unique(id, couple_id),
  check ((kind = 'photo') = (photo_path is not null)),
  check ((kind = 'drawing') = (drawing is not null)),
  check (photo_path is null or (split_part(photo_path,'/',1) = couple_id::text and split_part(photo_path,'/',2) = author_id::text)),
  check (kind = 'photo' or length(btrim(body)) > 0)
);
create index moments_couple on public.moments(couple_id, created_at desc);
create table public.reactions (
  moment_id uuid not null,
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(moment_id, user_id),
  foreign key(moment_id, couple_id) references public.moments(id, couple_id) on delete cascade
);
create table public.plans (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  kind text not null check (kind in ('date','wish')), planned_on date, done boolean not null default false,
  created_at timestamptz not null default now(), check ((kind = 'date') = (planned_on is not null))
);
create index plans_couple on public.plans(couple_id);
create table public.daily_answers (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade, day date not null,
  body text not null check (length(btrim(body)) between 1 and 500), unique(couple_id, author_id, day)
);
create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade, day date not null,
  choices integer[] not null check (cardinality(choices) = 5 and array_ndims(choices) = 1 and choices <@ array[0,1] and array_position(choices,null) is null),
  unique(couple_id, author_id, day)
);
create function private.answered_on(d date) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.daily_answers where couple_id = private.current_couple_id() and author_id = (select auth.uid()) and day = d);
$$;
create function private.played_quiz_on(d date) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.quiz_answers where couple_id = private.current_couple_id() and author_id = (select auth.uid()) and day = d);
$$;
create table public.canvas_strokes (
  id uuid primary key, couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  stroke jsonb not null check (public.valid_stroke(stroke) and stroke->>'id' = id::text and stroke->>'authorId' = author_id::text),
  created_at timestamptz not null default now()
);
create index canvas_couple on public.canvas_strokes(couple_id,created_at);
create function private.canvas_limit() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.couples where id = new.couple_id for update;
  if not exists(select 1 from public.canvas_strokes where id = new.id) and (select count(*) from public.canvas_strokes where couple_id = new.couple_id) >= 500 then raise exception 'This canvas is full. Save it, then remove your marks to make room.'; end if;
  return new;
end;
$$;
create trigger canvas_limit before insert on public.canvas_strokes for each row execute function private.canvas_limit();
create table public.games (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  players uuid[] not null check (cardinality(players) = 2),
  board integer[] not null default array_fill(0,array[42]) check (cardinality(board) = 42 and board <@ array[0,1,2]),
  turn smallint not null default 1 check (turn in (1,2)), winner smallint check (winner in (0,1,2)),
  status text not null default 'playing' check (status in ('playing','finished')),
  created_at timestamptz not null default now(), finished_at timestamptz,
  check ((status = 'finished') = (winner is not null and finished_at is not null))
);
create index games_couple on public.games(couple_id,created_at desc);
create unique index one_active_game on public.games(couple_id) where status = 'playing';

create function public.validate_couple() returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists(select 1 from pg_timezone_names where name = new.time_zone) then raise exception 'Choose a valid shared time zone.'; end if;
  if new.started_on > (now() at time zone new.time_zone)::date then raise exception 'Your start date must be today or earlier.'; end if;
  return new;
end;
$$;
create trigger validate_couple before insert or update on public.couples for each row execute function public.validate_couple();

-- RPCs, policies, grants, and storage follow in the second migration.
do $$ declare t text; begin
  foreach t in array array['profiles','couples','couple_members','pair_invites','pair_attempts','moments','reactions','plans','daily_answers','quiz_answers','canvas_strokes','games'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
  end loop;
end $$;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
commit;
