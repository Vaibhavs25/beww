// Client integration tests: real exported app, controlled HTTP/Auth and media doubles.
// These deliberately do not create hosted users or claim to test real WebRTC transport.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDemo, questionFor } from '../src/domain.ts';

const env = await readFile('.env', 'utf8');
const projectUrl = env.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '');
assert.ok(projectUrl, 'A configured public Supabase URL is needed to identify intercepted requests.');
const host = new URL(projectUrl).hostname;
const storageKey = `sb-${host.split('.')[0]}-auth-token`;
const base = process.env.PREVIEW_URL || 'http://localhost:8082';
const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const partner = '33333333-3333-4333-8333-333333333333';
const coupleA = 'aaaaaaaa-1111-4111-8111-111111111111';
const coupleB = 'bbbbbbbb-1111-4111-8111-111111111111';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const passed = []; const errors = [];
const check = label => { passed.push(label); console.log(`PASS ${label}`); };
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const token = id => {
  const expires = Math.floor(Date.now() / 1000) + 36000;
  const encoded = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  return { access_token: `${encoded({ alg: 'HS256', typ: 'JWT' })}.${encoded({ sub: id, role: 'authenticated', aud: 'authenticated', exp: expires })}.mock-signature`, refresh_token: 'mock-refresh-token', token_type: 'bearer', expires_in: 36000, expires_at: expires, user: { id, aud: 'authenticated', role: 'authenticated', email: `${id === alice ? 'alice' : 'bob'}@example.invalid`, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } };
};
const profile = (id, name) => ({ id, display_name: name, mood: 'calm', mood_note: '', need: '', mood_updated_at: new Date().toISOString() });
const message = n => ({ id: `dddddddd-1111-4111-8111-${String(n).padStart(12, '0')}`, couple_id: coupleB, author_id: bob, body: `History message ${n}`, created_at: new Date(1793600000000 + n * 1000).toISOString() });
let history = Array.from({ length: 150 }, (_, i) => message(i + 1));
const bobReadEntered = deferred();
let holdSend = null; let holdBob = null; let holdAnswer = null;
let sendStarted = false; let bobReadStarted = false; let answerStarted = false;
let dropNextSend = false; let logoutScope; let incoming = null;
const sentIds = []; const sentRows = new Map(); const historyReads = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.routeWebSocket(`wss://${host}/**`, ws => ws.close());
await context.route(`https://${host}/**`, async route => {
  const request = route.request(); const url = new URL(request.url());
  const respond = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
  let id = alice;
  try { id = JSON.parse(Buffer.from((request.headers().authorization ?? '').split('.')[1], 'base64url').toString()).sub; } catch { /* Auth routes can be anonymous. */ }
  if (url.pathname === '/auth/v1/user') return respond(token(id).user);
  if (url.pathname === '/auth/v1/logout') { logoutScope = url.searchParams.get('scope'); return route.fulfill({ status: 204 }); }
  if (url.pathname === '/functions/v1/call-ice') return respond({ iceServers: [{ urls: 'stun:mock.invalid' }], relayConfigured: false });
  const table = url.pathname.split('/').at(-1);
  const cid = id === alice ? coupleA : coupleB;
  if (table === 'profiles') {
    if (id === bob && holdBob) { bobReadStarted = true; bobReadEntered.resolve(); await holdBob.promise; }
    return respond(url.searchParams.has('id') ? profile(id, id === alice ? 'Alice' : 'Bob') : [profile(partner, 'Partner'), profile(id, id === alice ? 'Alice' : 'Bob')]);
  }
  if (table === 'couple_members') return respond({ couple_id: cid });
  if (table === 'couples') return respond({ id: cid, mode: 'distance', time_zone: 'UTC', started_on: '2025-01-01' });
  if (table === 'pets') return respond(null);
  if (table === 'calls') return respond(incoming);
  if (table === 'answer_call') { answerStarted = true; incoming = { ...incoming, state: 'accepted' }; await holdAnswer?.promise; return respond(null); }
  if (table === 'end_call') { incoming = incoming && { ...incoming, state: 'ended', offer: null, answer: null }; return respond(null); }
  if (table === 'send_chat_message') {
    const body = request.postDataJSON(); sentIds.push(body.message_id);
    const row = sentRows.get(body.message_id) ?? { id: body.message_id, couple_id: cid, author_id: id, body: body.message_body, created_at: new Date().toISOString() };
    sentRows.set(body.message_id, row); sendStarted = true;
    await holdSend?.promise;
    if (dropNextSend) { dropNextSend = false; return route.abort('connectionfailed'); }
    return respond(row);
  }
  if (table === 'chat_messages') {
    if (id === alice) return respond([{ id: 'cccccccc-1111-4111-8111-111111111111', author_id: alice, body: 'Only Alice’s private history', created_at: '2026-11-03T10:00:00Z' }]);
    const before = url.searchParams.get('or')?.match(/created_at\.lt\.([^,)]+)/)?.[1];
    const rows = history.filter(row => !before || Date.parse(row.created_at) < Date.parse(before)).slice(-100).reverse();
    historyReads.push({ before, first: rows.at(-1)?.body, count: rows.length });
    return respond(rows);
  }
  if (['moments', 'plans', 'daily_answers', 'canvas_strokes', 'games', 'quiz_answers', 'pet_care'].includes(table)) return respond([]);
  throw new Error(`Unexpected mock request: ${request.method()} ${url.pathname}`);
});
await context.addInitScript(({ key, session }) => {
  localStorage.setItem(key, JSON.stringify(session));
  // A corrupt demo save must not stop restoration of a valid live account.
  localStorage.setItem('closer.demo.v2', '{broken');
  class Peer extends EventTarget {
    iceGatheringState = 'complete'; connectionState = 'new'; localDescription = null; remoteDescription = null;
    addTrack() {} async createOffer() { return { type: 'offer', sdp: 'mock offer description' }; }
    async createAnswer() { return { type: 'answer', sdp: 'mock answer description' }; }
    async setLocalDescription(value) { this.localDescription = value; }
    async setRemoteDescription(value) { this.remoteDescription = value; }
    close() { this.connectionState = 'closed'; this.dispatchEvent(new Event('connectionstatechange')); }
  }
  window.RTCPeerConnection = Peer;
  navigator.mediaDevices.getUserMedia = async () => new MediaStream();
}, { key: storageKey, session: token(alice) });
const page = await context.newPage(); page.setDefaultTimeout(15000);
page.on('pageerror', error => errors.push(error.message));
await page.clock.install();
try {
  await page.goto(`${base}/chat`);
  await page.getByText('Only Alice’s private history', { exact: true }).waitFor();
  check('valid live account restores even with corrupt demo storage');
  if (await page.getByRole('button', { name: 'Dismiss error' }).isVisible()) await page.getByRole('button', { name: 'Dismiss error' }).click();
  dropNextSend = true;
  await page.getByRole('textbox', { name: 'Message your partner' }).fill('Retry this once');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
  assert.equal(await page.getByRole('textbox', { name: 'Message your partner' }).inputValue(), 'Retry this once');
  await page.getByRole('button', { name: 'Dismiss error' }).click();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('Retry this once', { exact: true }).waitFor();
  assert.equal(sentIds[0], sentIds[1]); assert.equal(sentRows.size, 1);
  check('lost send response retains the draft and retries the same message identifier');

  holdSend = deferred(); holdBob = deferred(); sendStarted = false;
  await page.getByRole('textbox', { name: 'Message your partner' }).fill('Late reply from Alice');
  const sending = page.waitForRequest(request => request.url().endsWith('/rpc/send_chat_message'));
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await sending; assert.ok(sendStarted);
  const bobReading = page.waitForRequest(request => request.url().includes(`/profiles?`) && new URL(request.url()).searchParams.get('id') === `eq.${bob}`);
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
    const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_IN', session }); channel.close();
  }, { key: storageKey, session: token(bob) });
  await page.getByText('Only Alice’s private history', { exact: true }).waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('textbox', { name: 'Message your partner' }).inputValue(), '');
  await bobReading; await bobReadEntered.promise; assert.equal(bobReadStarted, true);
  holdSend.resolve(); holdBob.resolve(); holdSend = null; holdBob = null;
  await page.getByText('History message 150', { exact: true }).waitFor();
  assert.equal(await page.getByText('Late reply from Alice', { exact: true }).count(), 0);
  check('account switch clears private drafts and rejects the prior account’s late write response');

  const earlier = () => page.getByRole('button', { name: 'Earlier messages', exact: true });
  await earlier().click();
  await earlier().waitFor({ state: 'hidden' });
  assert.equal(historyReads.at(-1).first, 'History message 1');
  history = Array.from({ length: 350 }, (_, i) => message(i + 1));
  await page.clock.fastForward(61000);
  await earlier().waitFor();
  for (const first of [151, 51, 1]) {
    const response = page.waitForResponse(r => r.url().includes('/chat_messages?') && new URL(r.url()).searchParams.has('or'));
    await earlier().click(); await response;
    await page.getByRole('textbox', { name: 'Message your partner' }).waitFor({ state: 'visible' });
    assert.equal(historyReads.at(-1).first, `History message ${first}`);
    if (first !== 1) await page.waitForFunction(() => document.querySelector('[aria-label="Earlier messages"]')?.getAttribute('aria-disabled') !== 'true');
  }
  await earlier().waitFor({ state: 'hidden' });
  check('reconnect after 200 missed messages can page through the entire gap');

  incoming = { id: 'eeeeeeee-1111-4111-8111-111111111111', couple_id: coupleB, caller_id: partner, recipient_id: bob, state: 'ringing', video: false, offer: { type: 'offer', sdp: 'mock incoming description' }, answer: null, created_at: new Date(await page.evaluate(() => Date.now())).toISOString() };
  holdAnswer = deferred();
  await page.getByRole('button', { name: 'Call from chat' }).click();
  await page.clock.fastForward(5100);
  const answering = page.waitForRequest(r => r.url().endsWith('/rpc/answer_call'));
  await page.getByRole('button', { name: 'Answer voice call' }).click();
  await page.getByRole('button', { name: 'End call' }).waitFor();
  await answering;
  assert.equal(answerStarted, true);
  await page.getByRole('button', { name: 'End call' }).click();
  holdAnswer.resolve(); holdAnswer = null;
  await page.getByRole('button', { name: 'A voice hello' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'End call', exact: true }).count(), 0);
  check('hanging up during a delayed answer does not revive the cancelled call');

  await page.getByRole('button', { name: 'Back to together' }).click();
  await page.getByRole('tab', { name: 'Us', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out on this device' }).click();
  await page.getByRole('button', { name: 'Switch demo partner' }).waitFor();
  assert.equal(logoutScope, 'local');
  check('device sign-out requests local scope and removes live state');

  const midnight = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await midnight.routeWebSocket(`wss://${host}/**`, ws => ws.close());
  await midnight.route(`https://${host}/**`, route => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
  const demo = createDemo(); demo.timeZone = 'UTC';
  await midnight.addInitScript(space => localStorage.setItem('closer.demo.v2', JSON.stringify({ space, userId: 'alex', onboarded: true })), demo);
  const daily = await midnight.newPage(); daily.on('pageerror', e => errors.push(e.message));
  await daily.clock.install({ time: new Date('2030-11-03T23:59:50Z') });
  await daily.goto(`${base}/question`); await daily.getByText(questionFor('2030-11-03'), { exact: true }).waitFor();
  await daily.getByRole('textbox', { name: 'Your answer', exact: true }).fill('A draft for yesterday’s question');
  await daily.clock.fastForward(40000);
  await daily.getByText(questionFor('2030-11-04'), { exact: true }).waitFor();
  assert.equal(await daily.getByRole('textbox', { name: 'Your answer', exact: true }).inputValue(), '');
  check('open daily question changes at shared midnight and clears the old draft');
  await midnight.close();
  assert.deepEqual(errors, []);
  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/client-sync-results.json', JSON.stringify({ passed, errors, scope: 'Mock HTTP/Auth/WebRTC; real browser app; no hosted users' }, null, 2));
} catch (error) {
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/client-sync-failure.png', fullPage: true });
  await writeFile('artifacts/client-sync-failure.txt', `${error.stack}\n${await page.locator('body').innerText()}\n${JSON.stringify({ passed, errors, historyReads })}`);
  throw error;
} finally { holdSend?.resolve(); holdBob?.resolve(); holdAnswer?.resolve(); await browser.close(); }
