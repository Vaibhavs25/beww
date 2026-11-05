import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDemo } from '../src/domain.ts';
import { dashboardTipsKey } from '../src/coach-marks.ts';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8084';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const passed = []; const errors = []; const check = message => { passed.push(message); console.log(`PASS ${message}`); };
await mkdir('artifacts', { recursive: true });
const context = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce' });
const space = createDemo(); space.quickNotes = []; space.moments = [];
await context.addInitScript(space => {
  if (!localStorage.getItem('closer.onboardedSpace.v1')) localStorage.setItem('closer.onboardedSpace.v1', JSON.stringify({ space, onboarded: true }));
}, space);
const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
let pickedFiles = 0; page.on('filechooser', () => { pickedFiles++; });
const dialog = () => page.getByRole('dialog', { name: 'Dashboard tips' });
const heading = text => dialog().getByRole('heading', { name: text, exact: true });
async function assertHighlight(id) {
  await page.waitForFunction(id => {
    const anchor = document.querySelector(`[data-testid="coach-target-${id}"]`);
    const highlight = document.querySelector('[data-testid="coach-mark-highlight"]');
    if (!anchor || !highlight) return false;
    const a = anchor.getBoundingClientRect(); const b = highlight.getBoundingClientRect();
    return a.width > 0 && b.left <= a.left + 1 && b.right >= a.right - 1 && b.top <= a.top + 1 && b.bottom >= a.bottom - 1 && a.top >= 0 && a.bottom <= innerHeight;
  }, id);
  const card = await page.getByTestId('coach-mark-card').boundingBox();
  const viewport = page.viewportSize();
  assert.ok(card.x >= 0 && card.y >= 0 && card.x + card.width <= viewport.width + 1 && card.y + card.height <= viewport.height + 1);
}
try {
  await page.goto(`${base}/story`, { waitUntil: 'networkidle' });
  assert.equal(await dialog().count(), 0);
  await page.getByRole('tab', { name: 'Today', exact: true }).click();
  await heading('Quick Notes').waitFor(); await assertHighlight('quick-notes');
  await page.screenshot({ path: 'artifacts/coach-marks-phone-quick-notes.png' });
  const before = await page.getByTestId('coach-target-quick-notes').boundingBox();
  await page.mouse.move(10, 150); await page.mouse.wheel(0, 500);
  const after = await page.getByTestId('coach-target-quick-notes').boundingBox(); assert.equal(Math.round(before.y), Math.round(after.y));
  check('first dashboard visit scrolls to Quick Notes and highlights its actual button without background scrolling');
  await dialog().getByRole('button', { name: 'Next: Instant Pic' }).click();
  await heading('Instant Pic').waitFor(); await assertHighlight('instant-pic');
  await page.screenshot({ path: 'artifacts/coach-marks-phone-instant-pic.png' });
  assert.equal(pickedFiles, 0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('closer.onboardedSpace.v1')).space);
  assert.equal(stored.quickNotes.length, 0); assert.equal(stored.moments.length, 0);
  check('Next highlights Instant Snap without opening the picker or posting anything');
  await dialog().getByRole('button', { name: 'Back', exact: true }).click();
  await heading('Quick Notes').waitFor(); await assertHighlight('quick-notes');
  await page.setViewportSize({ width: 1440, height: 1000 }); await assertHighlight('quick-notes');
  await page.screenshot({ path: 'artifacts/coach-marks-desktop.png' });
  await dialog().getByRole('button', { name: 'Next: Instant Pic' }).click();
  await heading('Instant Pic').waitFor(); await assertHighlight('instant-pic');
  await page.setViewportSize({ width: 640, height: 360 }); await assertHighlight('instant-pic');
  check('Back and viewport changes keep the spotlight aligned on desktop and landscape phones');
  await dialog().getByRole('button', { name: 'Got it' }).click(); await dialog().waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(key => localStorage.getItem(key), dashboardTipsKey('local:demo')), 'done');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await dialog().count(), 0);
  check('finishing persists completion and the tour stays dismissed after reload');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByPlaceholder('Write a quick sticky note (or optional caption for Instant Pic)…').fill('A hello after the tour');
  await page.getByRole('button', { name: 'Post sticky note' }).click();
  await page.getByText('“A hello after the tour”', { exact: true }).first().waitFor();
  check('the highlighted controls still work normally after the overlay closes');
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('closer.onboardedSpace.v1')); value.space.id = 'another-local-space';
    localStorage.setItem('closer.onboardedSpace.v1', JSON.stringify(value));
  });
  await page.reload({ waitUntil: 'networkidle' }); await heading('Quick Notes').waitFor();
  await dialog().getByRole('button', { name: 'Skip tour' }).click();
  await page.reload({ waitUntil: 'networkidle' }); assert.equal(await dialog().count(), 0);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), dashboardTipsKey('local:another-local-space')), 'done');
  check('Skip persists dismissal independently for another local space');
  await page.evaluate(key => localStorage.removeItem(key), dashboardTipsKey('local:another-local-space'));
  await page.reload(); await heading('Quick Notes').waitFor();
  await page.keyboard.press('Escape'); await dialog().waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(key => localStorage.getItem(key), dashboardTipsKey('local:another-local-space')), 'done');
  check('Escape dismisses accessibly and records completion');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/coach-marks-results.json', JSON.stringify({ passed, errors, pickedFiles }, null, 2));
} catch (error) {
  await page.screenshot({ path: 'artifacts/coach-marks-failure.png', fullPage: true });
  await writeFile('artifacts/coach-marks-failure.txt', `${error.stack}\n${await page.locator('body').innerText()}\n${JSON.stringify(errors)}`);
  throw error;
} finally { await browser.close(); }
