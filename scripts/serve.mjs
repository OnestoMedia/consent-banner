import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };

export function createStaticServer(root) {
  root = normalize(root);
  return createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pathname.includes('\0')) { res.writeHead(400).end(); return; }
    const resolved = resolve(root, '.' + pathname);
    const rel = relative(root, resolved);
    if (rel.startsWith('..') || isAbsolute(rel)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(resolved);
      res.writeHead(200, { 'content-type': types[extname(resolved)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const root = normalize(join(import.meta.dirname, '..'));
  createStaticServer(root).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
}
