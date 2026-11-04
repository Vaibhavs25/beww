import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const env=Object.fromEntries((await readFile('.env','utf8')).trim().split(/\r?\n/).filter(x=>x.includes('=')).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
const db=createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
const profiles=await db.from('profiles').select('id');
assert.ok(profiles.error); assert.match(profiles.error.message,/permission denied/); console.log('PASS hosted database denies anonymous profile access');
const invites=await db.rpc('create_invite',{relationship_mode:'nearby',shared_time_zone:'UTC'});
assert.ok(invites.error); assert.match(invites.error.message,/permission denied/); console.log('PASS hosted pairing cannot be called anonymously');
const call=await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/call-ice`,{method:'POST',headers:{apikey:env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:'{}'});
assert.equal(call.status,401); console.log('PASS calling endpoint verifies authentication itself');
for (const table of ['chat_messages','pets','pet_care','mood_entries']) {
  const result=await db.from(table).select('*').limit(1);
  assert.equal(result.error?.code,'42501'); console.log(`PASS hosted ${table} rejects anonymous reads`);
}
for (const [rpc,args] of [
  ['send_chat_message',{message_id:'aaaaaaaa-1111-4111-8111-111111111111',message_body:'Not authorized'}],
  ['adopt_pet',{pet_name:'Mochi',pet_kind:'bear'}],
  ['care_for_pet',{care_action:'feed'}],
  ['rename_pet',{pet_name:'Another name'}],
  ['log_mood',{feeling:'happy',note:'',support:''}],
  ['get_mood_history',{}],
  ['save_plan',{plan_id:null,draft:{},expected_revision:null}],
  ['respond_to_plan',{plan_id:'aaaaaaaa-1111-4111-8111-111111111111',going:true,expected_revision:1}],
]) {
  const result=await db.rpc(rpc,args); assert.equal(result.error?.code,'42501'); console.log(`PASS hosted ${rpc} rejects unauthenticated changes`);
}
