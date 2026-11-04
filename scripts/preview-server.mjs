import { createServer } from 'node:http';
import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT || 3000);
const APP_TITLE = 'Closer — Private Shared Space for Two Partners';
const APP_DESCRIPTION = 'Closer is a private shared space for two partners to share daily moods, 1-click instant pics, sticky quick notes, a 30-day memory lane, daily questions, date night plans, future adventures, a shared journal, relationship trivia, drawings, and calls.';

const FETCH_GUARD = `<script id="closer-fetch-guard">(function(){if(typeof window==='undefined')return;var g=globalThis;if(!g.expo||typeof g.expo!=='object')g.expo={};if(typeof g.expo.EventEmitter!=='function'){g.expo.EventEmitter=class EventEmitter{addListener(){return{remove:function(){}};}removeListener(){}removeAllListeners(){}emit(){}listenerCount(){return 0;}};}if(typeof g.expo.NativeModule!=='function'){g.expo.NativeModule=class NativeModule extends g.expo.EventEmitter{};}if(typeof g.expo.SharedObject!=='function'){g.expo.SharedObject=class SharedObject extends g.expo.EventEmitter{release(){}};}if(typeof g.expo.SharedRef!=='function'){g.expo.SharedRef=class SharedRef extends g.expo.SharedObject{constructor(){super();this.nativeRefType='unknown';}};}if(!g.expo.modules||typeof g.expo.modules!=='object')g.expo.modules={};function patch(t){if(!t)return;try{var d=Object.getOwnPropertyDescriptor(t,'fetch');if(d&&d.get&&!d.set&&d.configurable!==false){var g=d.get,v=null;Object.defineProperty(t,'fetch',{configurable:true,enumerable:d.enumerable!==false,get:function(){return v||g.call(this);},set:function(fn){if(typeof fn==='function')v=fn;}});}}catch(_){}}patch(window);if(typeof Window!=='undefined')patch(Window.prototype);try{var od=Object.defineProperty;Object.defineProperty=function(t,p,d){if((t===window||t===globalThis||(typeof Window!=='undefined'&&t===Window.prototype))&&p==='fetch'&&d&&d.get&&!d.set){var g=d.get,v=null;d={configurable:true,enumerable:d.enumerable!==false,get:function(){return v||g.call(this);},set:function(fn){if(typeof fn==='function')v=fn;}};}return od.call(Object,t,p,d);};}catch(_){}window.addEventListener('error',function(e){var m=String((e&&e.message)||''),f=String((e&&e.filename)||'');if(f.indexOf('chrome-extension://')===0||m.indexOf('Cannot set property fetch')!==-1){e.stopImmediatePropagation();e.preventDefault();}},true);})();</script>`;

const SEO_HEAD = `<meta name="description" content="${APP_DESCRIPTION}" />
    <meta name="theme-color" content="#FAF5EE" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Closer" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Closer" />
    <meta property="og:title" content="${APP_TITLE}" />
    <meta property="og:description" content="${APP_DESCRIPTION}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${APP_TITLE}" />
    <meta name="twitter:description" content="${APP_DESCRIPTION}" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" sizes="1024x1024" href="/assets/icon.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/assets/icon.png" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Closer',
      headline: APP_TITLE,
      applicationCategory: 'LifestyleApplication',
      applicationSubCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Web, iOS, Android',
      description: APP_DESCRIPTION,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })}</script>`;

const WEB_MANIFEST = JSON.stringify(
  {
    name: 'Closer — Your Little World, Together',
    short_name: 'Closer',
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF5EE',
    theme_color: '#FAF5EE',
    orientation: 'portrait',
    categories: ['lifestyle', 'social'],
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { src: '/assets/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/assets/icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      { src: '/assets/android-icon-foreground.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  null,
  2
);

function injectHtmlGuard(html) {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${APP_TITLE}</title>`);
  if (!out.includes('property="og:title"')) {
    out = out.replace('</head>', `    ${SEO_HEAD}\n  </head>`);
  }
  if (!out.includes('id="closer-fetch-guard"')) {
    out = out.replace('<head>', `<head>\n    ${FETCH_GUARD}`);
  }
  return out;
}

const indexPath = resolve(root, 'index.html');
const forceBuild = process.argv.includes('--build');

if (forceBuild || !existsSync(indexPath)) {
  const require = createRequire(import.meta.url);
  console.log('Building Closer web bundle...');
  const build = spawnSync(
    process.execPath,
    [require.resolve('expo/bin/cli'), 'export', '--platform', 'web', '--max-workers', '2'],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, CI: '1' } }
  );
  if (build.status !== 0) {
    if (build.stdout) process.stdout.write(build.stdout);
    if (build.stderr) process.stderr.write(build.stderr);
    process.exit(build.status ?? 1);
  }
  console.log('Closer web bundle exported to dist/');
}

if (existsSync(indexPath)) {
  const raw = await readFile(indexPath, 'utf8');
  const patched = injectHtmlGuard(raw);
  if (patched !== raw) await writeFile(indexPath, patched, 'utf8');
  await writeFile(resolve(root, 'manifest.json'), WEB_MANIFEST, 'utf8').catch(() => {});
}

if (forceBuild || process.argv.includes('--patch-only')) {
  process.exit(0);
}

const types = { '.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8' };
createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (path === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ status: 'ok', app: 'Closer', version: '1.0.0' }));
      return;
    }
    if (path === '/manifest.json') {
      res.writeHead(200, { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      res.end(WEB_MANIFEST);
      return;
    }
    if (path === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      res.end('User-agent: *\nAllow: /\n');
      return;
    }
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    let found = false;
    try { found = (await stat(file)).isFile(); } catch { found = false; }
    if (!found && path.startsWith('/assets/')) {
      const assetsRoot = resolve('assets');
      const assetCandidate = resolve(assetsRoot, `.${path.slice('/assets'.length)}`);
      if (assetCandidate.startsWith(assetsRoot + sep)) {
        try { if ((await stat(assetCandidate)).isFile()) { file = assetCandidate; found = true; } } catch {}
      }
    }
    if (!found) file = indexPath;
    const ext = extname(file);
    const body = ext === '.html' ? Buffer.from(injectHtmlGuard(await readFile(file, 'utf8')), 'utf8') : await readFile(file);
    res.writeHead(200,{
      'Content-Type':types[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  } catch { res.writeHead(500); res.end('Preview could not be loaded'); }
}).listen(port,'0.0.0.0',() => console.log(`Closer preview: http://0.0.0.0:${port}`));
