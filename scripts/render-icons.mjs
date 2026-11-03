import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/closer-mark.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  const render = async (svg, file, size = 1024) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{width:100vw;height:100vh;display:block}</style>${svg}`);
    await page.screenshot({ path: `assets/${file}`, omitBackground: true });
  };
  await render(source, 'icon.png');
  await render(source, 'favicon.png', 64);
  const transparent = source.replace(/\s*<rect[^>]*\/>/, '');
  await render(transparent, 'android-icon-foreground.png');
  await render(transparent.replace('fill="#F7DFE7"', 'fill="#A43859"'), 'android-icon-monochrome.png');
  console.log('Rendered Closer app icons from assets/closer-mark.svg');
} finally { await browser.close(); }
