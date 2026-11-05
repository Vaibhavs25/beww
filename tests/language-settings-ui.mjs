import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDemo } from '../src/domain.ts';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8084';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = []; const passed = []; const check = label => { passed.push(label); console.log(`PASS ${label}`); };
const watch = page => { page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message)); };
const localKey = 'closer.onboardedSpace.v1';
await mkdir('artifacts', { recursive: true });
let page;
let releaseSave;
try {
  const local = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await local.addInitScript(space => {
    if (!localStorage.getItem('closer.onboardedSpace.v1')) {
      localStorage.setItem('closer.onboardedSpace.v1', JSON.stringify({ space, onboarded: true }));
      localStorage.setItem('closer.dashboardTips.v1.local:demo', 'done');
    }
  }, createDemo());
  page = await local.newPage(); watch(page); await page.goto(`${base}/us`);
  await page.getByRole('radio', { name: 'English', exact: true }).waitFor();
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('An unsaved name');
  await page.getByRole('radio', { name: 'हिन्दी', exact: true }).click();
  await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio', { name: 'हिन्दी', exact: true }).isChecked(), true);
  assert.equal(await page.getByRole('textbox', { name: 'आपका नाम', exact: true }).inputValue(), 'An unsaved name');
  assert.equal(await page.getByRole('tab', { name: 'हम', exact: true }).count(), 1);
  await page.waitForFunction(() => document.documentElement.lang === 'hi');
  await page.screenshot({ path: 'artifacts/language-hindi-phone.png', fullPage: true });
  await page.reload(); await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  await page.evaluate(() => localStorage.removeItem('closer.dashboardTips.v1.local:demo'));
  await page.goto(base);
  const hindiTour = page.getByRole('dialog', { name: 'डैशबोर्ड की गाइड' });
  await hindiTour.getByRole('heading', { name: 'छोटे नोट', exact: true }).waitFor();
  await hindiTour.getByRole('button', { name: 'अगला: झटपट फ़ोटो' }).click();
  await hindiTour.getByRole('heading', { name: 'झटपट फ़ोटो', exact: true }).waitFor();
  await hindiTour.getByRole('button', { name: 'समझ गए' }).click();
  await page.getByRole('tab', { name: 'हम', exact: true }).click();
  check('the first-visit dashboard guide uses the selected Hindi language');
  let stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).space, localKey);
  assert.equal(stored.profiles.find(profile => profile.id === 'alex').language, 'hi');
  assert.equal(stored.profiles.find(profile => profile.id === 'jamie').language, undefined);
  check('local language toggle translates settings/navigation, preserves form drafts, and persists only for its profile');
  await page.getByRole('tab', { name: 'आज', exact: true }).click();
  await page.getByText('थोड़ा और करीब, Alex।', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  await page.getByRole('tab', { name: 'हम', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  await page.screenshot({ path: 'artifacts/language-hindi-desktop.png', fullPage: true });
  await page.getByRole('radio', { name: 'English', exact: true }).click();
  await page.getByText('A space that’s ours.', { exact: true }).waitFor();
  check('Hindi home greeting and narrow/desktop layouts work and English remains easy to select');
  await local.close();

  const env = await readFile('.env', 'utf8');
  const projectUrl = env.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '');
  assert.ok(projectUrl); const host = new URL(projectUrl).hostname; const authKey = `sb-${host.split('.')[0]}-auth-token`;
  const alice = '11111111-1111-4111-8111-111111111111'; const bob = '22222222-2222-4222-8222-222222222222';
  const cid = 'aaaaaaaa-1111-4111-8111-111111111111'; const profiles = new Map([
    [alice, { id: alice, display_name: 'Alice', language: 'en', mood: 'calm', mood_note: '', need: '', mood_updated_at: new Date().toISOString() }],
    [bob, { id: bob, display_name: 'Bob', language: 'en', mood: 'happy', mood_note: '', need: '', mood_updated_at: new Date().toISOString() }],
  ]);
  const session = id => {
    const exp = Math.floor(Date.now() / 1000) + 36000; const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    return { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, role: 'authenticated', aud: 'authenticated', exp })}.fixture`, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 36000, expires_at: exp, user: { id, aud: 'authenticated', role: 'authenticated', email: `${id === alice ? 'alice' : 'bob'}@example.invalid`, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } };
  };
  let failNext = true; let holdSave = false; let saveEntered = false; const writes = [];
  const newDevice = async id => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(({ authKey, saved }) => { if (!localStorage.getItem(authKey)) localStorage.setItem(authKey, JSON.stringify(saved)); localStorage.setItem(`closer.dashboardTips.v1.${saved.user.id}`, 'done'); }, { authKey, saved: session(id) });
    await context.routeWebSocket(`wss://${host}/**`, socket => socket.close());
    await context.route(`https://${host}/**`, async route => {
      const request = route.request(); const url = new URL(request.url());
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
      const respond = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
      let owner = id;
      try { owner = JSON.parse(Buffer.from(request.headers().authorization.split('.')[1], 'base64url').toString()).sub; } catch {}
      if (url.pathname === '/auth/v1/user') return respond(session(owner).user);
      if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204 });
      const table = url.pathname.split('/').at(-1);
      if (table === 'profiles') {
        if (request.method() === 'PATCH') {
          assert.equal(url.searchParams.get('id'), `eq.${owner}`); const body = request.postDataJSON(); assert.deepEqual(Object.keys(body), ['language']);
          writes.push({ owner, language: body.language }); saveEntered = true;
          if (holdSave) await new Promise(resolve => { releaseSave = resolve; });
          if (failNext) { failNext = false; return respond({ code: '42501', message: 'Fixture write denied' }, 403); }
          profiles.get(owner).language = body.language; return respond({ id: owner, language: body.language });
        }
        return respond(url.searchParams.has('id') ? profiles.get(owner) : [...profiles.values()]);
      }
      if (table === 'couple_members') return respond({ couple_id: cid });
      if (table === 'couples') return respond({ id: cid, started_on: '2025-06-15', mode: 'distance', time_zone: 'UTC' });
      if (table === 'pets') return respond(null);
      if (table === 'get_mood_history') return respond({ entries: [], streaks: [] });
      if (['moments', 'plans', 'daily_answers', 'canvas_strokes', 'games', 'quiz_answers', 'chat_messages', 'pet_care', 'calls'].includes(table)) return respond([]);
      throw new Error(`Unexpected language test request: ${request.method()} ${url.pathname}`);
    });
    const view = await context.newPage(); watch(view); await view.goto(`${base}/us`);
    await view.getByRole('radio', { name: profiles.get(id).language === 'hi' ? 'हिन्दी' : 'English', exact: true }).waitFor();
    return { context, page: view };
  };
  const first = await newDevice(alice); page = first.page;
  await page.getByRole('radio', { name: 'हिन्दी', exact: true }).click();
  await page.getByText('Could not save your language. Please try again.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio', { name: 'English', exact: true }).isChecked(), true);
  assert.equal(profiles.get(alice).language, 'en');
  await page.getByRole('button', { name: 'Dismiss error' }).click();
  check('a rejected Supabase write keeps the current language and displays a retryable error');
  await page.getByRole('radio', { name: 'हिन्दी', exact: true }).click();
  await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  assert.equal(profiles.get(alice).language, 'hi'); assert.equal(profiles.get(bob).language, 'en');
  await page.reload(); await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  const second = await newDevice(alice); await second.page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  const partner = await newDevice(bob); await partner.page.getByText('A space that’s ours.', { exact: true }).waitFor();
  check('successful preference is restored from Supabase on reload and a second device while the partner stays in English');
  await partner.context.close(); await second.context.close();
  await page.reload(); await page.getByText('हमारी अपनी दुनिया।', { exact: true }).waitFor();
  holdSave = true; saveEntered = false;
  await page.getByRole('radio', { name: 'English', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[role="radio"][aria-label="English"]')?.getAttribute('aria-disabled') === 'true');
  assert.equal(saveEntered, true);
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value)); const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_IN', session: value }); channel.close();
  }, { key: authKey, value: session(bob) });
  await page.getByText('A space that’s ours.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('radio', { name: 'English', exact: true }).isChecked(), true);
  releaseSave(); holdSave = false; releaseSave = undefined;
  await page.getByText('Bob & Alice', { exact: true }).first().waitFor();
  assert.equal(profiles.get(bob).language, 'en'); assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.ok(writes.every(write => write.owner === alice));
  check('pending saves disable repeated toggles and an account switch ignores the previous account’s late response');
  await first.context.close();
  assert.deepEqual(errors, []);
  await writeFile('artifacts/language-settings-results.json', JSON.stringify({ passed, errors, writes }, null, 2));
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: 'artifacts/language-settings-failure.png', fullPage: true });
    await writeFile('artifacts/language-settings-failure.txt', `${error.stack}\n${await page.locator('body').innerText()}\n${JSON.stringify(errors)}`);
  }
  throw error;
} finally { releaseSave?.(); await browser.close(); }
