-- Hosted database integration check. No accounts or content survive ROLLBACK.
-- Run as the project database administrator, never from the mobile app.
begin;
do $$
declare
  first_user uuid := gen_random_uuid(); second_user uuid := gen_random_uuid(); stranger uuid := gen_random_uuid();
  message_id uuid := gen_random_uuid(); invitation jsonb; joined jsonb; saved jsonb; changed jsonb; pet jsonb; draft jsonb;
begin
  insert into auth.users(id,aud,role,raw_user_meta_data) values
    (first_user,'authenticated','authenticated','{"display_name":"Verification A"}'),
    (second_user,'authenticated','authenticated','{"display_name":"Verification B"}'),
    (stranger,'authenticated','authenticated','{"display_name":"Verification outsider"}');
  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claim.sub',first_user::text,true);
  invitation := public.create_invite('distance','Asia/Kolkata');
  perform set_config('request.jwt.claim.sub',second_user::text,true);
  joined := public.join_couple(invitation->>'code');
  if joined ? 'error' then raise exception 'Verification pairing failed'; end if;
  perform set_config('request.jwt.claim.sub',first_user::text,true);
  perform public.send_chat_message(message_id,'A private verification message');
  perform public.send_chat_message(message_id,'A private verification message');
  perform public.log_mood('low','Verification mood','Just listen');
  perform public.log_mood('calm','Verification update','Quiet time');
  if (select count(*) from public.mood_entries) <> 1 then raise exception 'Repeated daily mood was duplicated'; end if;
  if (select mood from public.mood_entries) <> 'calm' or (select day from public.mood_entries) <> private.couple_today() then raise exception 'Mood or shared day was incorrect'; end if;
  if ((public.get_mood_history()->'streaks'->0)->>'days')::integer <> 1 then raise exception 'Mood streak was incorrect'; end if;
  if (select count(*) from public.chat_messages) <> 1 then raise exception 'Message retry was duplicated'; end if;
  pet := public.adopt_pet('Mochi','bear');
  perform public.care_for_pet('feed');
  pet := public.care_for_pet('feed');
  if (pet->>'care_points')::integer <> 5 then raise exception 'Repeated care earned points'; end if;
  draft := jsonb_build_object('title','Our test date','kind','date','date',private.couple_today()::text,'time','19:30','place','Closer call','notes','Verification only','format','virtual');
  saved := public.save_plan(null,draft,null);
  perform set_config('request.jwt.claim.sub',second_user::text,true);
  if (select count(*) from public.chat_messages) <> 1 then raise exception 'Partner could not read chat'; end if;
  if (select count(*) from public.mood_entries) <> 1 then raise exception 'Partner could not read mood history'; end if;
  perform public.log_mood('happy');
  if jsonb_array_length(public.get_mood_history()->'entries') <> 2 then raise exception 'Partner check-in was not recorded'; end if;
  pet := public.care_for_pet('feed');
  if (pet->>'care_points')::integer <> 10 then raise exception 'Partner care did not count'; end if;
  changed := public.respond_to_plan((saved->>'id')::uuid,true,1);
  if jsonb_array_length(changed->'accepted_by') <> 2 then raise exception 'Partner confirmation failed'; end if;
  changed := public.save_plan((saved->>'id')::uuid,draft || '{"time":"20:00"}'::jsonb,1);
  if jsonb_array_length(changed->'accepted_by') <> 1 or (changed->>'revision')::integer <> 2 then raise exception 'Changed date retained stale confirmations'; end if;
  perform set_config('request.jwt.claim.sub',stranger::text,true);
  if exists(select 1 from public.chat_messages) or exists(select 1 from public.pets) or exists(select 1 from public.pet_care) or exists(select 1 from public.plans) or exists(select 1 from public.mood_entries) or jsonb_array_length(public.get_mood_history()->'entries') <> 0 then raise exception 'Outsider could read couple data'; end if;
  perform set_config('role','none',true);
end;
$$;
rollback;
select 'PASS: hosted pairing, chat retry, daily mood updates and streaks, partner pet care, date reconfirmation, and outsider isolation; all verification data rolled back' as result;
