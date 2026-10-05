// ---------------------------------------------------------------------------
// Run the whole site on your own computer, backend included:
//
//   1. copy .env.example to .env and fill it in
//   2. npm run dev
//   3. open http://localhost:8888
//
// It serves the public/ folder and runs the files in netlify/functions/ the
// same way Netlify does. No packages to install; it needs Node 18 or newer.
// ---------------------------------------------------------------------------
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const PORT = Number(process.env.PORT) || 8888;

// load .env (KEY=value lines) without any dependency
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// map each function's config.path (e.g. /api/login) to its handler
const routes = {};
for (const f of fs.readdirSync(path.join(ROOT, 'netlify/functions')).filter((f) => f.endsWith('.mjs'))) {
  const mod = await import(pathToFileURL(path.join(ROOT, 'netlify/functions', f)));
  routes[mod.config?.path || `/.netlify/functions/${f.replace('.mjs', '')}`] = mod.default;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const handler = routes[url.pathname];
  if (handler) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    try {
      const out = await handler(request, { ip: req.socket.remoteAddress });
      res.writeHead(out.status, Object.fromEntries(out.headers));
      res.end(Buffer.from(await out.arrayBuffer()));
    } catch (e) {
      console.error(e);
      res.writeHead(500, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  let file = path.join(ROOT, 'public', decodeURIComponent(url.pathname));
  if (!file.startsWith(path.join(ROOT, 'public'))) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end('Not found');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`KwongPosh running at http://localhost:${PORT}`));
