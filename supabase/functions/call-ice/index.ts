import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Sign in first' }, 401);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error } = await db.auth.getUser(authorization.slice(7));
  if (error || !user) return json({ error: 'Invalid session' }, 401);
  const members = await db.from('couple_members').select('user_id');
  if (members.error || members.data.length !== 2) return json({ error: 'Connect your partner first' }, 403);
  const urls = Deno.env.get('TURN_URLS')?.split(',').map(url => url.trim()).filter(url => /^turns?:/.test(url));
  const secret = Deno.env.get('TURN_AUTH_SECRET');
  const iceServers: Record<string, unknown>[] = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (urls?.length && secret) {
    // coturn REST credentials expire after one hour. The shared secret stays server-side.
    const username = `${Math.floor(Date.now() / 1000) + 3600}:${user.id}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(username));
    const credential = btoa(String.fromCharCode(...new Uint8Array(signature)));
    iceServers.push({ urls, username, credential });
  }
  return json({ iceServers, relayConfigured: iceServers.length > 1 });
});
