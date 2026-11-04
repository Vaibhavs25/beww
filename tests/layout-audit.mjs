import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createDemo } from '../src/domain.ts';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
const space = createDemo();
space.profiles[0].name = 'AlexandriaAlexandriaAlexandriaXX'.slice(0, 30);
space.profiles[1].name = 'ChristopherChristopherChristop'.slice(0, 30);
await context.addInitScript(value => localStorage.setItem('closer.onboardedSpace.v1', JSON.stringify({ space: value, onboarded: true })), space);
const page = await context.newPage(); const results = []; const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.PREVIEW_URL || 'http://localhost:3000';
await mkdir('artifacts', { recursive: true });
try {
  for (const route of ['/', '/chat', '/together', '/story', '/us', '/draw', '/game', '/quiz', '/question', '/plans', '/pet', '/compose?kind=photo', '/mood', '/connect', '/welcome', '/call', '/adventures', '/journal', '/milestones', '/trivia', '/legal']) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    if (!['/welcome'].includes(route)) assert.ok(!(await page.url()).endsWith('/welcome'), `Route ${route} must load the requested screen`);
    const scan = await page.evaluate(() => ({
      documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: [...document.querySelectorAll('[role="button"], [role="tab"], [role="radio"], input, textarea')].map(node => {
        const r = node.getBoundingClientRect();
        let parent = node.parentElement; let horizontal = false;
        while (parent) { if (['auto','scroll'].includes(getComputedStyle(parent).overflowX) && parent.scrollWidth > parent.clientWidth + 1) { horizontal = true; break; } parent = parent.parentElement; }
        return { label: node.getAttribute('aria-label') || node.textContent?.trim().slice(0, 80), x: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), visible: r.width > 0 && r.height > 0 && !horizontal };
      }).filter(item => item.visible && (item.x < -1 || item.right > innerWidth + 1)),
    }));
    results.push({ route, ...scan });
    if (scan.documentOverflow || scan.clipped.length) await page.screenshot({ path: `artifacts/layout-${route.replace(/[^a-z]/g, '') || 'today'}.png`, fullPage: true });
  }
  await writeFile('artifacts/layout-audit.json', JSON.stringify({ viewport: { width: 360, height: 800 }, names: space.profiles.map(p => p.name), results, errors }, null, 2));
  const issues = results.filter(r => r.documentOverflow || r.clipped.length);
  console.log(JSON.stringify(issues, null, 2));
  assert.deepEqual(errors, []);
  assert.equal(issues.length, 0, 'Interactive controls must remain within a 360px phone with maximum-length names.');
  console.log(`PASS ${results.length} routes with maximum-length names at 360px`);
} finally { await browser.close(); }
