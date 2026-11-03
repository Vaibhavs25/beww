-- Keep privileged implementation and invitation secrets out of the exposed API schema.
begin;
alter table public.pair_invites set schema private;
alter table public.pair_attempts set schema private;
alter function public.create_invite(text,text) set schema private;
alter function public.join_couple(text) set schema private;
alter function public.start_game() set schema private;
alter function public.play_move(uuid,integer) set schema private;
alter function public.start_call(boolean,jsonb) set schema private;
alter function public.answer_call(uuid,jsonb) set schema private;
alter function public.end_call(uuid,boolean) set schema private;

create or replace function private.create_invite(relationship_mode text default 'nearby', shared_time_zone text default 'UTC') returns jsonb language plpgsql security definer set search_path = '' as $$
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
  if exists(select 1 from private.pair_invites where couple_id = cid and created_at > now() - interval '10 seconds') then raise exception 'Wait a few seconds before making a new invitation.'; end if;
  delete from private.pair_invites where couple_id = cid or expires_at < now();
  code := upper(left(replace(gen_random_uuid()::text,'-',''),10));
  insert into private.pair_invites(code_hash,couple_id,created_by,expires_at) values (sha256(convert_to(code,'UTF8')),cid,uid,expiration);
  return jsonb_build_object('code',code,'couple_id',cid,'expires_at',expiration);
end;
$$;

create or replace function private.join_couple(invite_code text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); invitation private.pair_invites%rowtype; old_cid uuid;
begin
  if uid is null then raise exception 'Sign in first.'; end if;
  perform 1 from public.profiles where id = uid for update;
  -- Invalid attempts return normally so the attempt log survives the transaction.
  delete from private.pair_attempts where user_id = uid and attempted_at < now() - interval '15 minutes';
  if (select count(*) from private.pair_attempts where user_id = uid) >= 10 then return jsonb_build_object('error','Too many attempts. Please wait 15 minutes.'); end if;
  insert into private.pair_attempts(user_id) values (uid);
  select * into invitation from private.pair_invites where code_hash = sha256(convert_to(upper(btrim(invite_code)),'UTF8')) for update;
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
  delete from private.pair_invites where couple_id = invitation.couple_id;
  delete from private.pair_attempts where user_id = uid;
  return jsonb_build_object('couple_id',invitation.couple_id);
end;
$$;

create function public.create_invite(relationship_mode text default 'nearby', shared_time_zone text default 'UTC') returns jsonb language sql security invoker set search_path = '' as $$ select private.create_invite(relationship_mode,shared_time_zone); $$;
revoke all on function public.create_invite(text,text) from public,anon;
grant execute on function public.create_invite(text,text) to authenticated;

create function public.join_couple(invite_code text) returns jsonb language sql security invoker set search_path = '' as $$ select private.join_couple(invite_code); $$;
revoke all on function public.join_couple(text) from public,anon;
grant execute on function public.join_couple(text) to authenticated;

create function public.start_game() returns uuid language sql security invoker set search_path = '' as $$ select private.start_game(); $$;
revoke all on function public.start_game() from public,anon;
grant execute on function public.start_game() to authenticated;

create function public.play_move(game_id uuid, col integer) returns void language sql security invoker set search_path = '' as $$ select private.play_move(game_id,col); $$;
revoke all on function public.play_move(uuid,integer) from public,anon;
grant execute on function public.play_move(uuid,integer) to authenticated;

create function public.start_call(is_video boolean, session_offer jsonb) returns jsonb language sql security invoker set search_path = '' as $$ select private.start_call(is_video,session_offer); $$;
revoke all on function public.start_call(boolean,jsonb) from public,anon;
grant execute on function public.start_call(boolean,jsonb) to authenticated;

create function public.answer_call(call_id uuid, session_answer jsonb) returns void language sql security invoker set search_path = '' as $$ select private.answer_call(call_id,session_answer); $$;
revoke all on function public.answer_call(uuid,jsonb) from public,anon;
grant execute on function public.answer_call(uuid,jsonb) to authenticated;

create function public.end_call(call_id uuid, decline boolean default false) returns void language sql security invoker set search_path = '' as $$ select private.end_call(call_id,decline); $$;
revoke all on function public.end_call(uuid,boolean) from public,anon;
grant execute on function public.end_call(uuid,boolean) to authenticated;

-- Cover foreign keys for predictable account cleanup and relationship queries.
create index calls_caller_id_idx on public.calls(caller_id);
create index calls_recipient_id_idx on public.calls(recipient_id);
create index canvas_strokes_author_id_idx on public.canvas_strokes(author_id);
create index daily_answers_author_id_idx on public.daily_answers(author_id);
create index moments_author_id_idx on public.moments(author_id);
create index plans_author_id_idx on public.plans(author_id);
create index quiz_answers_author_id_idx on public.quiz_answers(author_id);
create index reactions_couple_id_idx on public.reactions(couple_id);
create index reactions_user_id_idx on public.reactions(user_id);
create index reactions_moment_couple_idx on public.reactions(moment_id,couple_id);
create index pair_invites_creator_idx on private.pair_invites(created_by);
commit;
