-- Backend logic for generating a unique 6-digit invitation code and verifying/linking two user accounts into a shared Space.
begin;

create or replace function private.generate_invitation_code(
  relationship_mode text default 'nearby',
  shared_time_zone text default 'UTC'
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  code text;
  code_digest bytea;
  attempt integer := 0;
  expiration timestamptz := now() + interval '10 minutes';
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;
  if coalesce(relationship_mode, '') not in ('nearby', 'distance') then
    raise exception 'Choose nearby or distance mode.';
  end if;

  perform 1 from public.profiles where id = uid for update;
  cid := private.current_couple_id();
  if cid is null then
    insert into public.couples(mode, time_zone, started_on)
    values (relationship_mode, shared_time_zone, (now() at time zone shared_time_zone)::date)
    returning id into cid;

    insert into public.couple_members(user_id, couple_id, seat)
    values (uid, cid, 1);
  end if;

  perform 1 from public.couples where id = cid for update;
  if (select count(*) from public.couple_members where couple_id = cid) >= 2 then
    raise exception 'Your partner is already connected. Account linking is a one-time process.';
  end if;

  if exists(
    select 1 from private.pair_invites
    where couple_id = cid and created_at > now() - interval '10 seconds'
  ) then
    raise exception 'Wait a few seconds before making a new invitation.';
  end if;

  delete from private.pair_invites where couple_id = cid or expires_at < now();

  loop
    attempt := attempt + 1;
    -- Generate a 6-digit numeric code between 100000 and 999999
    code := (((('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))::bit(32)::bigint) % 900000) + 100000)::text;
    code_digest := sha256(convert_to(code, 'UTF8'));
    exit when not exists(select 1 from private.pair_invites where code_hash = code_digest);
    if attempt >= 25 then raise exception 'Could not create an invitation. Please try again.'; end if;
  end loop;

  insert into private.pair_invites(code_hash, couple_id, created_by, expires_at)
  values (code_digest, cid, uid, expiration);

  return jsonb_build_object(
    'code', code,
    'couple_id', cid,
    'expires_at', expiration
  );
end;
$$;

create or replace function public.generate_invitation_code(
  relationship_mode text default 'nearby',
  shared_time_zone text default 'UTC'
) returns jsonb language sql security invoker set search_path = '' as $$
  select private.generate_invitation_code(relationship_mode, shared_time_zone);
$$;

create or replace function private.verify_and_link_space(
  invite_code text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cleaned_code text;
  invitation private.pair_invites%rowtype;
  old_cid uuid;
  couple_row public.couples%rowtype;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;

  perform 1 from public.profiles where id = uid for update;

  -- Clean expired rate-limit entries and enforce max 10 attempts per 15 minutes
  delete from private.pair_attempts where user_id = uid and attempted_at < now() - interval '15 minutes';
  if (select count(*) from private.pair_attempts where user_id = uid) >= 10 then
    return jsonb_build_object('error', 'Too many attempts. Please wait 15 minutes.');
  end if;
  insert into private.pair_attempts(user_id) values (uid);

  cleaned_code := regexp_replace(upper(btrim(coalesce(invite_code, ''))), '[^A-Z0-9]', '', 'g');
  if cleaned_code like 'CLSR%' then
    cleaned_code := substr(cleaned_code, 5);
  end if;

  if cleaned_code !~ '^[0-9]{6}$' and length(cleaned_code) not between 6 and 12 then
    return jsonb_build_object('error', 'Enter a valid 6-digit invitation code.');
  end if;

  select * into invitation
  from private.pair_invites
  where code_hash = sha256(convert_to(cleaned_code, 'UTF8'))
  for update;

  if not found or invitation.expires_at < now() or invitation.created_by = uid then
    return jsonb_build_object('error', 'That 6-digit invitation code is invalid or expired. Ask your partner for a new code.');
  end if;

  select * into couple_row from public.couples where id = invitation.couple_id for update;
  if (select count(*) from public.couple_members where couple_id = invitation.couple_id) <> 1 then
    return jsonb_build_object('error', 'This invitation code has already been used.');
  end if;

  old_cid := private.current_couple_id();
  if old_cid is not null then
    perform 1 from public.couples where id = old_cid for update;
    if (select count(*) from public.couple_members where couple_id = old_cid) <> 1 then
      return jsonb_build_object('error', 'You already have a connected partner.');
    end if;
    if exists(select 1 from public.moments where couple_id = old_cid)
      or exists(select 1 from public.plans where couple_id = old_cid)
      or exists(select 1 from public.chat_messages where couple_id = old_cid)
      or exists(select 1 from public.daily_answers where couple_id = old_cid)
      or exists(select 1 from public.quiz_answers where couple_id = old_cid)
      or exists(select 1 from public.canvas_strokes where couple_id = old_cid)
      or exists(select 1 from public.games where couple_id = old_cid)
      or exists(select 1 from public.pets where couple_id = old_cid)
      or exists(select 1 from public.mood_entries where couple_id = old_cid) then
      return jsonb_build_object('error', 'This account already has a shared story.');
    end if;
    delete from public.couples where id = old_cid;
  end if;

  insert into public.couple_members(user_id, couple_id, seat)
  values (uid, invitation.couple_id, 2);

  delete from private.pair_invites where couple_id = invitation.couple_id;
  delete from private.pair_attempts where user_id = uid;

  return jsonb_build_object(
    'couple_id', invitation.couple_id,
    'linked', true,
    'mode', couple_row.mode,
    'time_zone', couple_row.time_zone,
    'started_on', couple_row.started_on
  );
end;
$$;

create or replace function public.verify_and_link_space(
  invite_code text
) returns jsonb language sql security invoker set search_path = '' as $$
  select private.verify_and_link_space(invite_code);
$$;

revoke all on function private.generate_invitation_code(text, text), private.verify_and_link_space(text) from public, anon, authenticated;
revoke all on function public.generate_invitation_code(text, text), public.verify_and_link_space(text) from public, anon, authenticated;
grant execute on function private.generate_invitation_code(text, text), private.verify_and_link_space(text) to authenticated;
grant execute on function public.generate_invitation_code(text, text), public.verify_and_link_space(text) to authenticated;

notify pgrst, 'reload schema';
commit;
