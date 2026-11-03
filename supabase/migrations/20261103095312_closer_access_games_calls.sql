begin;

create function public.create_invite(relationship_mode text default 'nearby', shared_time_zone text default 'UTC') returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); cid uuid; code text; expiration timestamptz := now() + interval '10 minutes';
begin
  if uid is null then raise exception 'Sign in first.'; end if;
  perform 1 from public.profiles where id = uid for update;
  cid := private.current_couple_id();
  if cid is null then
    insert into public.couples(mode,time_zone,started_on) values (relationship_mode,shared_time_zone,(now() at time zone shared_time_zone)::date) returning id into cid;
    insert into public.couple_members(user_id,couple_id,seat) values (uid,cid,1);
  end if;
  perform 1 from public.couples where id = cid for update;
  if (select count(*) from public.couple_members where couple_id = cid) >= 2 then raise exception 'Your partner is already connected.'; end if;
  if exists(select 1 from public.pair_invites where couple_id = cid and created_at > now() - interval '10 seconds') then raise exception 'Wait a few seconds before making a new invitation.'; end if;
  delete from public.pair_invites where couple_id = cid or expires_at < now();
  code := upper(left(replace(gen_random_uuid()::text,'-',''),10));
  insert into public.pair_invites(code_hash,couple_id,created_by,expires_at) values (sha256(convert_to(code,'UTF8')),cid,uid,expiration);
  return jsonb_build_object('code',code,'couple_id',cid,'expires_at',expiration);
end;
$$;

create function public.join_couple(invite_code text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); invitation public.pair_invites%rowtype; old_cid uuid;
begin
  if uid is null then raise exception 'Sign in first.'; end if;
  perform 1 from public.profiles where id = uid for update;
  -- Invalid attempts return normally so the attempt log survives the transaction.
  delete from public.pair_attempts where user_id = uid and attempted_at < now() - interval '15 minutes';
  if (select count(*) from public.pair_attempts where user_id = uid) >= 10 then return jsonb_build_object('error','Too many attempts. Please wait 15 minutes.'); end if;
  insert into public.pair_attempts(user_id) values (uid);
  select * into invitation from public.pair_invites where code_hash = sha256(convert_to(upper(btrim(invite_code)),'UTF8')) for update;
  if not found or invitation.expires_at < now() or invitation.created_by = uid then return jsonb_build_object('error','That invitation is invalid or expired. Ask your partner for a new code.'); end if;
  perform 1 from public.couples where id = invitation.couple_id for update;
  if (select count(*) from public.couple_members where couple_id = invitation.couple_id) <> 1 then return jsonb_build_object('error','This invitation has already been used.'); end if;
  old_cid := private.current_couple_id();
  if old_cid is not null then
    perform 1 from public.couples where id = old_cid for update;
    if (select count(*) from public.couple_members where couple_id = old_cid) <> 1 then return jsonb_build_object('error','You already have a connected partner.'); end if;
    -- Both users may create an invitation. It is safe to discard a still-empty space.
    if exists(select 1 from public.moments where couple_id = old_cid) then return jsonb_build_object('error','This account already has a shared story.'); end if;
    delete from public.couples where id = old_cid;
  end if;
  insert into public.couple_members(user_id,couple_id,seat) values (uid,invitation.couple_id,2);
  delete from public.pair_invites where couple_id = invitation.couple_id;
  delete from public.pair_attempts where user_id = uid;
  return jsonb_build_object('couple_id',invitation.couple_id);
end;
$$;

create function public.start_game() returns uuid language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); gid uuid; ids uuid[];
begin
  if cid is null or not private.pair_ready() then raise exception 'Connect your partner first.'; end if;
  perform 1 from public.couples where id = cid for update;
  select id into gid from public.games where couple_id = cid and status = 'playing';
  if gid is not null then return gid; end if;
  select array_agg(user_id order by seat) into ids from public.couple_members where couple_id = cid;
  insert into public.games(couple_id,players) values (cid,ids) returning id into gid;
  return gid;
end;
$$;
create function public.play_move(game_id uuid, col integer) returns void language plpgsql security definer set search_path = '' as $$
declare g public.games%rowtype; r integer := 5; rr integer; cc integer; dr integer; dc integer; direction integer; matched integer; won boolean := false; full_board boolean;
begin
  select * into g from public.games where id = game_id and couple_id = private.current_couple_id() for update;
  if not found then raise exception 'This game is not in your space.'; end if;
  if g.status <> 'playing' then raise exception 'This round is finished. Start a rematch.'; end if;
  if g.players[g.turn] <> auth.uid() then raise exception 'It is your partner''s turn.'; end if;
  if col is null or col < 0 or col > 6 then raise exception 'Choose a column on the board.'; end if;
  while r >= 0 and g.board[r*7+col+1] <> 0 loop r := r-1; end loop;
  if r < 0 then raise exception 'That column is full.'; end if;
  g.board[r*7+col+1] := g.turn;
  for dr,dc in select * from (values (0,1),(1,0),(1,1),(1,-1)) as directions(a,b) loop
    matched := 1;
    foreach direction in array array[-1,1] loop
      rr := r+dr*direction; cc := col+dc*direction;
      while rr >= 0 and rr < 6 and cc >= 0 and cc < 7 and g.board[rr*7+cc+1] = g.turn loop
        matched := matched+1; rr := rr+dr*direction; cc := cc+dc*direction;
      end loop;
    end loop;
    if matched >= 4 then won := true; end if;
  end loop;
  full_board := not (0 = any(g.board));
  update public.games set board = g.board, turn = case when g.turn = 1 then 2 else 1 end,
    winner = case when won then g.turn when full_board then 0 else null end,
    status = case when won or full_board then 'finished' else 'playing' end,
    finished_at = case when won or full_board then now() else null end where id = game_id;
end;
$$;

create policy own_or_partner_profile on public.profiles for select to authenticated using (id = (select auth.uid()) or id in (select user_id from public.couple_members where couple_id = (select private.current_couple_id())));
create policy edit_own_profile on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy read_couple on public.couples for select to authenticated using (id = (select private.current_couple_id()));
create policy edit_couple on public.couples for update to authenticated using (id = (select private.current_couple_id())) with check (id = (select private.current_couple_id()));
create policy read_members on public.couple_members for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy read_moments on public.moments for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy add_moment on public.moments for insert to authenticated with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()) and (select private.pair_ready()));
create policy remove_own_moment on public.moments for delete to authenticated using (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()));
create policy read_reactions on public.reactions for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy add_reaction on public.reactions for insert to authenticated with check (couple_id = (select private.current_couple_id()) and user_id = (select auth.uid()));
create policy remove_reaction on public.reactions for delete to authenticated using (couple_id = (select private.current_couple_id()) and user_id = (select auth.uid()));
create policy read_plans on public.plans for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy add_plan on public.plans for insert to authenticated with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()) and (select private.pair_ready()) and (planned_on is null or planned_on >= (select private.couple_today())));
create policy complete_plan on public.plans for update to authenticated using (couple_id = (select private.current_couple_id())) with check (couple_id = (select private.current_couple_id()));
create policy read_answers on public.daily_answers for select to authenticated using (couple_id = (select private.current_couple_id()) and (author_id = (select auth.uid()) or private.answered_on(day)));
create policy add_answer on public.daily_answers for insert to authenticated with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()) and day = (select private.couple_today()) and (select private.pair_ready()));
create policy read_quiz on public.quiz_answers for select to authenticated using (couple_id = (select private.current_couple_id()) and (author_id = (select auth.uid()) or private.played_quiz_on(day)));
create policy add_quiz on public.quiz_answers for insert to authenticated with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()) and day = (select private.couple_today()) and (select private.pair_ready()));
create policy read_canvas on public.canvas_strokes for select to authenticated using (couple_id = (select private.current_couple_id()));
create policy add_stroke on public.canvas_strokes for insert to authenticated with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()) and (select private.pair_ready()));
create policy retry_own_stroke on public.canvas_strokes for update to authenticated using (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid())) with check (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()));
create policy remove_own_stroke on public.canvas_strokes for delete to authenticated using (couple_id = (select private.current_couple_id()) and author_id = (select auth.uid()));
create policy read_games on public.games for select to authenticated using (couple_id = (select private.current_couple_id()));

create table public.calls (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  caller_id uuid not null references public.profiles(id) on delete cascade, recipient_id uuid not null references public.profiles(id) on delete cascade,
  video boolean not null, state text not null default 'ringing' check (state in ('ringing','accepted','ended','declined')),
  offer jsonb, answer jsonb, created_at timestamptz not null default now(), ended_at timestamptz,
  check (caller_id <> recipient_id), check (pg_column_size(offer) < 60000 and pg_column_size(answer) < 60000)
);
alter table public.calls enable row level security;
revoke all on public.calls from anon, authenticated;
create index calls_couple on public.calls(couple_id,created_at desc);
create unique index one_active_call on public.calls(couple_id) where state in ('ringing','accepted');
create policy read_own_call on public.calls for select to authenticated using (couple_id = (select private.current_couple_id()) and (caller_id = (select auth.uid()) or recipient_id = (select auth.uid())));
create function public.start_call(is_video boolean, session_offer jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare cid uuid := private.current_couple_id(); partner uuid; result public.calls;
begin
  if cid is null or not private.pair_ready() then raise exception 'Connect your partner first.'; end if;
  if session_offer is null or session_offer->>'type' is distinct from 'offer' or coalesce(length(session_offer->>'sdp'),0) not between 10 and 50000 then raise exception 'Invalid call offer.'; end if;
  perform 1 from public.couples where id = cid for update;
  update public.calls set state = 'ended', offer = null, answer = null, ended_at = now() where couple_id = cid and ((state = 'ringing' and created_at < now() - interval '90 seconds') or (state = 'accepted' and created_at < now() - interval '4 hours'));
  if exists(select 1 from public.calls where couple_id = cid and state in ('ringing','accepted')) then raise exception 'You already have a call in progress.'; end if;
  if (select count(*) from public.calls where couple_id = cid and created_at > now() - interval '1 minute') >= 5 then raise exception 'Please wait a minute before calling again.'; end if;
  select user_id into partner from public.couple_members where couple_id = cid and user_id <> auth.uid();
  insert into public.calls(couple_id,caller_id,recipient_id,video,offer) values (cid,auth.uid(),partner,is_video,session_offer) returning * into result;
  return to_jsonb(result);
end;
$$;
create function public.answer_call(call_id uuid, session_answer jsonb) returns void language plpgsql security definer set search_path = '' as $$
begin
  if session_answer is null or session_answer->>'type' is distinct from 'answer' or coalesce(length(session_answer->>'sdp'),0) not between 10 and 50000 then raise exception 'Invalid call answer.'; end if;
  update public.calls set answer = session_answer, state = 'accepted' where id = call_id and couple_id = private.current_couple_id() and recipient_id = auth.uid() and state = 'ringing' and created_at > now() - interval '90 seconds';
  if not found then raise exception 'This call is no longer waiting for an answer.'; end if;
end;
$$;
create function public.end_call(call_id uuid, decline boolean default false) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.calls set state = case when decline and recipient_id = auth.uid() and state = 'ringing' then 'declined' else 'ended' end, offer = null, answer = null, ended_at = now()
  where id = call_id and couple_id = private.current_couple_id() and auth.uid() in (caller_id,recipient_id) and state in ('ringing','accepted');
end;
$$;

grant select on public.profiles,public.couples,public.couple_members,public.games,public.calls to authenticated;
grant update(display_name,mood,mood_note,need,mood_updated_at) on public.profiles to authenticated;
grant update(started_on,mode) on public.couples to authenticated;
grant select,insert,delete on public.moments,public.reactions to authenticated;
grant select,insert on public.plans,public.daily_answers,public.quiz_answers to authenticated;
grant update(done) on public.plans to authenticated;
grant select,insert,update,delete on public.canvas_strokes to authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.current_couple_id(),private.pair_ready(),private.couple_today(),private.answered_on(date),private.played_quiz_on(date),public.valid_stroke(jsonb),public.valid_drawing(jsonb),public.create_invite(text,text),public.join_couple(text),public.start_game(),public.play_move(uuid,integer) to authenticated;
grant execute on function public.start_call(boolean,jsonb),public.answer_call(uuid,jsonb),public.end_call(uuid,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('couple-photos','couple-photos',false,5242880,array['image/jpeg']);
create policy read_couple_photos on storage.objects for select to authenticated using (bucket_id = 'couple-photos' and (storage.foldername(name))[1] = (select private.current_couple_id())::text);
create policy upload_own_photos on storage.objects for insert to authenticated with check (bucket_id = 'couple-photos' and (storage.foldername(name))[1] = (select private.current_couple_id())::text and (storage.foldername(name))[2] = (select auth.uid())::text and (select private.pair_ready()));
create policy remove_own_photos on storage.objects for delete to authenticated using (bucket_id = 'couple-photos' and (storage.foldername(name))[1] = (select private.current_couple_id())::text and (storage.foldername(name))[2] = (select auth.uid())::text);

do $$ declare t text; begin
  foreach t in array array['profiles','couples','couple_members','moments','reactions','plans','daily_answers','quiz_answers','canvas_strokes','games','calls'] loop
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;
commit;
