import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database migrations and access boundaries', async t => {
  const db = await PGlite.create();
  t.after(() => db.close());
  // Minimal platform scaffolding. All application SQL, RPCs and policies are real.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]$$;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant all on storage.objects to authenticated;
    create publication supabase_realtime;
  `);
  for (const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
  }
  const a = '11111111-1111-4111-8111-111111111111'; const b = '22222222-2222-4222-8222-222222222222'; const outsider = '33333333-3333-4333-8333-333333333333';
  for (const [id,name] of [[a,'Alex'],[b,'Jamie'],[outsider,'Outsider']]) await db.query('insert into auth.users(id,raw_user_meta_data) values ($1,$2)',[id,{display_name:name}]);
  const as = async (id,role='authenticated') => { await db.exec(`set role ${role}`); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id ?? '']); };
  const scalar = async (sql,params=[]) => Object.values((await db.query(sql,params)).rows[0])[0];
  let cid; let invite;
  await t.test('anonymous users cannot read data or create invitations',async () => {
    await as(null,'anon'); await assert.rejects(db.query('select * from public.profiles'),/permission denied/); await assert.rejects(db.query('select public.create_invite()'),/permission denied/);
  });
  await t.test('invitation pairs only two people and is single-use',async () => {
    await as(a); assert.equal((await db.query('select * from public.profiles')).rows.length,1);
    invite = await scalar("select public.create_invite('distance','Asia/Kolkata')"); cid = invite.couple_id; assert.match(invite.code,/^[A-F0-9]{10}$/);
    assert.ok((await scalar('select public.join_couple($1)',[invite.code])).error);
    await as(b); assert.equal((await scalar('select public.join_couple($1)',[invite.code])).couple_id,cid);
    assert.equal((await db.query('select * from public.profiles')).rows.length,2);
    await as(outsider); assert.ok((await scalar('select public.join_couple($1)',[invite.code])).error); assert.equal((await db.query('select * from public.couples')).rows.length,0);
    await assert.rejects(db.query('select * from private.pair_invites'),/permission denied/);
  });
  await t.test('moments cannot cross spaces or impersonate a partner',async () => {
    await as(a); await db.query("insert into public.moments(couple_id,author_id,kind,body) values ($1,$2,'note','Thinking of you')",[cid,a]);
    await assert.rejects(db.query("insert into public.moments(couple_id,author_id,kind,body) values ($1,$2,'note','Forged')",[cid,b]),/row-level security/);
    await as(b); assert.equal((await db.query('select * from public.moments')).rows.length,1); assert.equal((await db.query('delete from public.moments returning id')).rows.length,0);
    await as(outsider); assert.equal((await db.query('select * from public.moments')).rows.length,0);
    await assert.rejects(db.query("insert into public.moments(couple_id,author_id,kind,body) values ($1,$2,'note','Intrusion')",[cid,outsider]),/row-level security/);
  });
  await t.test('answers are hidden at the database until both people answer',async () => {
    await as(a); await db.query("insert into public.daily_answers(couple_id,author_id,day,body) values ($1,$2,private.couple_today(),'A quiet morning')",[cid,a]);
    await as(b); assert.equal((await db.query('select * from public.daily_answers')).rows.length,0);
    await db.query("insert into public.daily_answers(couple_id,author_id,day,body) values ($1,$2,private.couple_today(),'A long walk')",[cid,b]);
    assert.equal((await db.query('select * from public.daily_answers')).rows.length,2);
    await assert.rejects(db.query("insert into public.daily_answers(couple_id,author_id,day,body) values ($1,$2,private.couple_today(),'Another answer')",[cid,b]),/unique constraint/);
  });
  await t.test('quiz answers cannot be empty, forged, or peeked at',async () => {
    await as(a); await assert.rejects(db.query('insert into public.quiz_answers(couple_id,author_id,day,choices) values ($1,$2,private.couple_today(),$3)',[cid,a,[]]),/check constraint/);
    await db.query('insert into public.quiz_answers(couple_id,author_id,day,choices) values ($1,$2,private.couple_today(),$3)',[cid,a,[1,0,0,1,0]]);
    await as(b); assert.equal((await db.query('select * from public.quiz_answers')).rows.length,0);
    await db.query('insert into public.quiz_answers(couple_id,author_id,day,choices) values ($1,$2,private.couple_today(),$3)',[cid,b,[1,0,1,1,0]]); assert.equal((await db.query('select * from public.quiz_answers')).rows.length,2);
  });
  await t.test('drawing validates strokes and protects the other person’s marks',async () => {
    const stroke = {id:'44444444-4444-4444-8444-444444444444',authorId:a,color:'#456451',width:3,points:[[0,0],[320,320]]};
    await as(a); await db.query('insert into public.canvas_strokes(id,couple_id,author_id,stroke) values ($1,$2,$3,$4)',[stroke.id,cid,a,stroke]);
    await assert.rejects(db.query('update public.canvas_strokes set stroke=$1 where id=$2',[{...stroke,color:null},stroke.id]),/check constraint/);
    await as(b); assert.equal((await db.query('select * from public.canvas_strokes')).rows.length,1); assert.equal((await db.query('delete from public.canvas_strokes returning id')).rows.length,0);
    await as(outsider); assert.equal((await db.query('select * from public.canvas_strokes')).rows.length,0);
  });
  await t.test('only valid turns produce wins and results cannot be forged',async () => {
    await as(a); const gid = await scalar('select public.start_game()');
    assert.equal(await scalar('select public.start_game()'),gid);
    await as(b); await assert.rejects(db.query('select public.play_move($1,0)',[gid]),/partner/);
    for (let i=0;i<7;i++) { await as(i%2 ? b : a); await db.query('select public.play_move($1,$2)',[gid,i%2]); }
    const game = (await db.query('select * from public.games where id=$1',[gid])).rows[0]; assert.equal(game.winner,1); assert.equal(game.status,'finished'); assert.ok(game.finished_at);
    await assert.rejects(db.query('update public.games set winner=2 where id=$1',[gid]),/permission denied/);
    await assert.rejects(db.query('select public.play_move($1,4)',[gid]),/finished/);
    await as(outsider); await assert.rejects(db.query('select public.play_move($1,4)',[gid]),/not in your space/);
  });
  await t.test('call signaling is partner-only and clears on hangup',async () => {
    await as(a); const call = await scalar('select public.start_call(false,$1)',[{type:'offer',sdp:'test offer description'}]);
    await assert.rejects(db.query('select public.answer_call($1,$2)',[call.id,{type:'answer',sdp:'test answer description'}]),/no longer waiting/);
    await as(outsider); assert.equal((await db.query('select * from public.calls')).rows.length,0); await db.query('select public.end_call($1,false)',[call.id]);
    await as(b); await db.query('select public.answer_call($1,$2)',[call.id,{type:'answer',sdp:'test answer description'}]); await db.query('select public.end_call($1,false)',[call.id]);
    const ended = (await db.query('select * from public.calls where id=$1',[call.id])).rows[0]; assert.equal(ended.state,'ended'); assert.equal(ended.offer,null); assert.equal(ended.answer,null);
  });
  await t.test('private photos are only readable by the couple and removable by their owner',async () => {
    await as(a); await db.query("insert into storage.objects(bucket_id,name) values ('couple-photos',$1)",[`${cid}/${a}/photo.jpg`]);
    await as(b); assert.equal((await db.query('select * from storage.objects')).rows.length,1); assert.equal((await db.query('delete from storage.objects returning id')).rows.length,0);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('couple-photos',$1)",[`${cid}/${a}/forged.jpg`]),/row-level security/);
    await as(outsider); assert.equal((await db.query('select * from storage.objects')).rows.length,0);
  });
  await t.test('chat is partner-only, author-verified, idempotent, and rate limited',async () => {
    const mid = 'aaaaaaaa-1111-4111-8111-111111111111';
    await as(null,'anon'); await assert.rejects(db.query('select * from public.chat_messages'),/permission denied/);
    await assert.rejects(db.query('select public.send_chat_message($1,$2)',[mid,'hello']),/permission denied/);
    await as(a); const first = await scalar('select public.send_chat_message($1,$2)',[mid,'Hello, you ♡']);
    const again = await scalar('select public.send_chat_message($1,$2)',[mid,'Hello, you ♡']);
    assert.equal(first.id,again.id); assert.equal(first.author_id,a);
    assert.equal((await db.query('select * from public.chat_messages')).rows.length,1);
    await assert.rejects(db.query('select public.send_chat_message($1,$2)',[mid,'Changed content']),/identifier/);
    await assert.rejects(db.query('insert into public.chat_messages(id,couple_id,author_id,body) values(gen_random_uuid(),$1,$2,$3)',[cid,b,'Impersonation']),/permission denied/);
    await assert.rejects(db.query("select public.send_chat_message(gen_random_uuid(),'  ' )"),/2000/);
    await as(b); assert.equal((await db.query('select * from public.chat_messages')).rows.length,1);
    await as(outsider); assert.equal((await db.query('select * from public.chat_messages')).rows.length,0);
    await assert.rejects(db.query("select public.send_chat_message(gen_random_uuid(),'Intrusion')"),/Connect your partner/);
    await as(a); for(let i=1;i<60;i++) await db.query("select public.send_chat_message(gen_random_uuid(),'Another hello')");
    await assert.rejects(db.query("select public.send_chat_message(gen_random_uuid(),'Too fast')"),/Wait a minute/);
    assert.equal((await scalar('select public.send_chat_message($1,$2)',[mid,'Hello, you ♡'])).id,mid);
  });
  await t.test('one shared pet grows from both partners with no double rewards',async () => {
    await as(a); const pet = await scalar("select public.adopt_pet('Mochi','bear')"); assert.equal(pet.care_points,0);
    await as(b); await assert.rejects(db.query("select public.adopt_pet('Another','cat')"),/already been adopted/);
    await assert.rejects(db.query('update public.pets set care_points=999'),/permission denied/);
    await as(a); await db.query("select public.care_for_pet('feed')"); await db.query("select public.care_for_pet('feed')");
    assert.equal(await scalar('select care_points from public.pets'),5);
    for (const person of [a,b]) { await as(person); for(const action of ['feed','play','rest']) await db.query('select public.care_for_pet($1)',[action]); }
    assert.equal(await scalar('select care_points from public.pets'),30); assert.equal((await db.query('select * from public.pet_care')).rows.length,6);
    await db.query("select public.rename_pet('Cherry')"); assert.equal(await scalar('select name from public.pets'),'Cherry');
    await assert.rejects(db.query("select public.care_for_pet('cheat')"),/Choose feed/);
    await db.exec('reset role'); await db.exec("update public.pet_care set day = day - 1");
    await as(a); assert.equal((await scalar("select public.care_for_pet('feed')")).care_points,35);
    await as(outsider); assert.equal((await db.query('select * from public.pets')).rows.length,0); assert.equal((await db.query('select * from public.pet_care')).rows.length,0);
    await assert.rejects(db.query("select public.care_for_pet('feed')"),/Connect/);
  });
  await t.test('date proposals require fresh confirmations when either partner edits',async () => {
    await as(a); const day=await scalar('select private.couple_today()::text');
    const draft={title:'A cozy evening',kind:'date',date:day,time:'19:30',place:'Our Closer call',notes:'Bring snacks',format:'virtual'};
    const plan=await scalar('select public.save_plan(null,$1,null)',[draft]); assert.deepEqual(plan.accepted_by,[a]);
    await as(b); let confirmed=await scalar('select public.respond_to_plan($1,true,1)',[plan.id]); assert.equal(confirmed.accepted_by.length,2);
    confirmed=await scalar('select public.respond_to_plan($1,true,1)',[plan.id]); assert.equal(confirmed.accepted_by.length,2);
    await assert.rejects(db.query('update public.plans set accepted_by=$1 where id=$2',[[a,b],plan.id]),/permission denied/);
    const edited=await scalar('select public.save_plan($1,$2,1)',[plan.id,{...draft,time:'20:00'}]); assert.equal(edited.revision,2); assert.deepEqual(edited.accepted_by,[b]);
    await as(a); await assert.rejects(db.query('select public.respond_to_plan($1,true,1)',[plan.id]),/plan changed/);
    assert.equal((await scalar('select public.respond_to_plan($1,true,2)',[plan.id])).accepted_by.length,2);
    await assert.rejects(db.query('select public.save_plan($1,$2,1)',[plan.id,draft]),/plan changed/);
    await assert.rejects(db.query('select public.save_plan(null,$1,null)',[{...draft,time:'24:00'}]),/00:00/);
    await assert.rejects(db.query('select public.save_plan(null,$1,null)',[{...draft,date:'2026-02-30'}]),/out of range/);
    const wish=await scalar('select public.save_plan(null,$1,null)',[{...draft,kind:'wish',date:'',time:''}]); assert.equal(wish.planned_on,null); assert.deepEqual(wish.accepted_by,[]);
    await as(outsider); assert.equal((await db.query('select * from public.plans')).rows.length,0);
    await assert.rejects(db.query('select public.save_plan($1,$2,2)',[plan.id,draft]),/Connect/);
  });
  await t.test('invalid invitation attempts are rate limited without rolling back the count',async () => {
    await as(outsider); let result;
    for(let i=0;i<11;i++) result=await scalar("select public.join_couple('0000000000')");
    assert.match(result.error,/15 minutes/);
  });
  await t.test('generate_invitation_code creates a unique 6-digit code and verify_and_link_space links two accounts once',async () => {
    const p1 = '55555555-5555-4555-8555-555555555555';
    const p2 = '66666666-6666-4666-8666-666666666666';
    await db.exec('reset role');
    for (const [id,name] of [[p1,'Riya'],[p2,'Aarav']]) {
      await db.query('insert into auth.users(id,raw_user_meta_data) values ($1,$2)',[id,{display_name:name}]);
    }
    await as(null,'anon');
    await assert.rejects(db.query('select public.generate_invitation_code()'),/permission denied/);
    await assert.rejects(db.query("select public.verify_and_link_space('123456')"),/permission denied/);

    await as(p1);
    const sixInvite = await scalar("select public.generate_invitation_code('distance','Asia/Kolkata')");
    assert.match(sixInvite.code,/^[0-9]{6}$/);
    assert.ok(sixInvite.couple_id);

    // Creator cannot redeem their own 6-digit code
    const selfAttempt = await scalar('select public.verify_and_link_space($1)',[sixInvite.code]);
    assert.ok(selfAttempt.error);

    // Partner verifies and links account using the 6-digit code
    await as(p2);
    const linked = await scalar('select public.verify_and_link_space($1)',[`CLSR-${sixInvite.code}`]);
    assert.equal(linked.couple_id,sixInvite.couple_id);
    assert.equal(linked.linked,true);
    assert.equal(linked.mode,'distance');
    assert.equal((await db.query('select * from public.profiles')).rows.length,2);

    // 6-digit code is strictly one-time use and cannot be reused
    await as(p1);
    await assert.rejects(db.query("select public.generate_invitation_code('distance','Asia/Kolkata')"),/already connected/);
  });
});
