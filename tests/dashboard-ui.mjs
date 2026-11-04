import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDemo, questionFor } from '../src/domain.ts';

const base = process.env.PREVIEW_URL || 'http://localhost:8082';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage(); page.setDefaultTimeout(15000);
const errors = []; const passed = []; const check = label => { passed.push(label); console.log(`PASS ${label}`); };
page.on('pageerror', error => errors.push(error.message));
const instant = '2026-11-05T18:29:00Z'; const now = Date.parse(instant);
const space = createDemo(); space.timeZone = 'Asia/Kolkata'; space.answers = []; space.moments = [];
space.profiles.forEach(person => { person.moodAt = instant; });
await context.addInitScript(value => {
  if (!localStorage.getItem('closer.demo.v2')) localStorage.setItem('closer.demo.v2', JSON.stringify({ space: value, userId: 'alex', onboarded: true }));
}, space);
await mkdir('artifacts', { recursive: true });
try {
  await page.clock.install({ time: new Date(instant) }); await page.clock.setFixedTime(new Date(instant));
  await page.goto(base);
  await page.getByRole('button', { name: 'Add our first photo' }).waitFor();
  assert.equal(await page.getByTestId('mood-streak').getByText('A fresh start', { exact: true }).count(), 2);
  check('empty home shows an honest photo invitation and no invented mood streak');
  await page.getByRole('button', { name: 'Check in', exact: true }).click();
  await page.getByRole('radio', { name: 'Low', exact: true }).click();
  await page.getByRole('button', { name: 'Share how I’m feeling' }).click();
  await page.getByTestId('mood-streak').getByText('1 day in a row', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Update today’s mood' }).click();
  await page.getByRole('radio', { name: 'Happy', exact: true }).click();
  await page.getByRole('button', { name: 'Share how I’m feeling' }).click();
  await page.getByRole('button', { name: 'Switch demo partner' }).click();
  await page.getByRole('button', { name: 'Check in', exact: true }).click();
  await page.getByRole('radio', { name: 'Calm', exact: true }).click();
  await page.getByRole('button', { name: 'Share how I’m feeling' }).click();
  await page.reload(); await page.getByRole('button', { name: 'Update today’s mood' }).waitFor();
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('closer.demo.v2')).space);
  assert.equal(saved.moodHistory.entries.length, 2); assert.equal(saved.moodHistory.entries.find(row => row.authorId === 'alex').mood, 'happy');
  assert.equal(await page.getByTestId('mood-streak').getByText('1 day in a row', { exact: true }).count(), 2);
  check('both partners log moods; a same-day edit stays one entry and survives reload');
  await page.getByRole('button', { name: 'Answer today’s question' }).click();
  await page.getByRole('textbox', { name: 'Your answer' }).fill('The Little Cherry Café');
  await page.getByRole('button', { name: 'Share my answer' }).click();
  await page.getByRole('button', { name: 'See the other side' }).click();
  assert.equal(await page.getByText('The Little Cherry Café', { exact: true }).count(), 0);
  await page.getByRole('textbox', { name: 'Your answer' }).fill('Coffee & Cuddles');
  await page.getByRole('button', { name: 'Share my answer' }).click();
  await page.getByText('The Little Cherry Café', { exact: true }).waitFor();
  await page.getByText('Coffee & Cuddles', { exact: true }).waitFor();
  await page.goto(base); await page.getByRole('button', { name: 'Read our answers' }).waitFor();
  check('daily question opens the shared answer flow and keeps a partner’s answer hidden until yours');

  const image = `data:image/png;base64,${(await readFile('assets/icon.png')).toString('base64')}`;
  // Test fixtures use the app icon, never invented personal photos in the product.
  const photos = Array.from({ length: 8 }, (_, i) => ({ id: `photo-${i}`, kind: 'photo', authorId: i % 2 ? 'jamie' : 'alex', text: `Shared photo ${i}`, image, hearts: [], createdAt: new Date(now - i * 86400000).toISOString() }));
  photos.push({ ...photos[0], id: 'old', text: 'Outside the photo window', createdAt: new Date(now - 31 * 86400000).toISOString() });
  photos.push({ ...photos[0], id: 'future', text: 'A future photo', createdAt: new Date(now + 86400000).toISOString() });
  await page.evaluate(moments => { const saved = JSON.parse(localStorage.getItem('closer.demo.v2')); saved.space.moments = moments; localStorage.setItem('closer.demo.v2', JSON.stringify(saved)); }, photos);
  await page.reload();
  const lane = page.getByTestId('memory-lane');
  await lane.getByRole('button', { name: /Open photo: Shared photo 0,/ }).click();
  await page.getByRole('button', { name: 'Close photo' }).waitFor();
  await page.getByRole('button', { name: 'Close photo' }).click();
  assert.equal(await lane.getByRole('button', { name: /Outside the photo window|A future photo/ }).count(), 0);
  await lane.getByRole('button', { name: 'Next memories' }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="memory-lane"] *')].some(node => node.scrollLeft > 10));
  check('recent photos open in a viewer and scroll horizontally; old and future photos are excluded');

  await page.setViewportSize({ width: 1440, height: 1100 }); await page.goto(base); await page.getByText('A little closer, Alex.').waitFor();
  await page.screenshot({ path: 'artifacts/dashboard-desktop.png', fullPage: true });
  await page.getByTestId('daily-question').screenshot({ path: 'artifacts/dashboard-daily-question.png' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth + 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  await page.getByTestId('mood-streak').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'artifacts/dashboard-mobile-checkins.png' });
  await lane.scrollIntoViewIfNeeded(); await page.screenshot({ path: 'artifacts/dashboard-mobile-memories.png' });
  check('redesigned dashboard fits desktop and 360px mobile widths');
  await page.clock.setFixedTime(new Date('2026-11-05T18:30:01Z')); await page.clock.runFor(30010);
  await page.getByTestId('daily-question').getByText(questionFor('2026-11-06'), { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Check in', exact: true }).waitFor();
  assert.equal(await page.getByTestId('mood-streak').getByText('1 day in a row', { exact: true }).count(), 2);
  check('shared midnight rotates the question, resets today’s action, and retains yesterday’s streak');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/dashboard-ui.json', JSON.stringify({ passed, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: 'artifacts/dashboard-failure.png', fullPage: true });
  await writeFile('artifacts/dashboard-failure.txt', `${error.stack}\n${await page.locator('body').innerText()}\n${JSON.stringify(errors)}`);
  throw error;
} finally { await browser.close(); }
