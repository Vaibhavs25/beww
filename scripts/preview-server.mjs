import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT || 3000);
const FETCH_GUARD = `<script id="closer-fetch-guard">(function(){if(typeof window==='undefined')return;function patch(t){if(!t)return;try{var d=Object.getOwnPropertyDescriptor(t,'fetch');if(d&&d.get&&!d.set&&d.configurable!==false){var g=d.get,v=null;Object.defineProperty(t,'fetch',{configurable:true,enumerable:d.enumerable!==false,get:function(){return v||g.call(this);},set:function(fn){if(typeof fn==='function')v=fn;}});}}catch(_){}}patch(window);if(typeof Window!=='undefined')patch(Window.prototype);try{var od=Object.defineProperty;Object.defineProperty=function(t,p,d){if((t===window||t===globalThis||(typeof Window!=='undefined'&&t===Window.prototype))&&p==='fetch'&&d&&d.get&&!d.set){var g=d.get,v=null;d={configurable:true,enumerable:d.enumerable!==false,get:function(){return v||g.call(this);},set:function(fn){if(typeof fn==='function')v=fn;}};}return od.call(Object,t,p,d);};}catch(_){}window.addEventListener('error',function(e){var m=String((e&&e.message)||''),f=String((e&&e.filename)||'');if(f.indexOf('chrome-extension://')===0||m.indexOf('Cannot set property fetch')!==-1){e.stopImmediatePropagation();e.preventDefault();}},true);})();</script>`;

function injectHtmlGuard(html) {
  if (html.includes('id="closer-fetch-guard"')) return html;
  return html.replace('<head>', `<head>\n    ${FETCH_GUARD}`);
}

const indexPath = resolve(root, 'index.html');
if (!existsSync(indexPath)) {
  const require = createRequire(import.meta.url);
  console.log('Building Closer web bundle...');
  const build = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'export', '--platform', 'web', '--max-workers', '2'], { stdio: 'inherit', env: { ...process.env, CI: '1' } });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

if (existsSync(indexPath)) {
  const raw = await readFile(indexPath, 'utf8');
  const patched = injectHtmlGuard(raw);
  if (patched !== raw) await writeFile(indexPath, patched, 'utf8');
}

if (process.argv.includes('--patch-only')) {
  process.exit(0);
}

const types = { '.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon' };
createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    try { if (!(await stat(file)).isFile()) file = indexPath; } catch { file = indexPath; }
    const ext = extname(file);
    const body = ext === '.html' ? Buffer.from(injectHtmlGuard(await readFile(file, 'utf8')), 'utf8') : await readFile(file);
    res.writeHead(200,{'Content-Type':types[ext] || 'application/octet-stream','Cache-Control':'no-store'}); res.end(body);
  } catch { res.writeHead(500); res.end('Preview could not be loaded'); }
}).listen(port,'0.0.0.0',() => console.log(`Closer preview: http://0.0.0.0:${port}`));
