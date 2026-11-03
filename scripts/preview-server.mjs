import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist'); const port = Number(process.env.PORT || 8082);
const types = { '.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon' };
createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    try { if (!(await stat(file)).isFile()) file = resolve(root,'index.html'); } catch { file = resolve(root,'index.html'); }
    res.writeHead(200,{'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}); res.end(await readFile(file));
  } catch { res.writeHead(500); res.end('Preview could not be loaded'); }
}).listen(port,'127.0.0.1',() => console.log(`Closer preview: http://localhost:${port}`));
