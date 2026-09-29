import { afterAll, beforeAll, expect, test } from 'vitest';
import { join } from 'node:path';
import { request } from 'node:http';
import { createStaticServer } from '../scripts/serve.mjs';

const root = join(import.meta.dirname, '..');
let server;
let port;

beforeAll(async () => {
  server = createStaticServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

// Raw HTTP request with an exact, unmodified request-line path — unlike fetch(), Node's
// http.request() sends the literal string given here on the wire (no client-side URL
// normalization), so any collapsing of ".." segments we observe happens on the server side.
function rawGet(path) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves a known file with 200', async () => {
  const res = await rawGet('/package.json');
  expect(res.statusCode).toBe(200);
});

test('rejects an encoded ../ traversal to a system file with 403', async () => {
  const res = await rawGet('/..%2fetc%2fpasswd');
  expect(res.statusCode).toBe(403);
});

test('literal ../ never serves foreign content (WHATWG URL collapses it back into root)', async () => {
  // `new URL(req.url, 'http://x')` inside the server resolves literal dot-segments per the
  // URL spec before our guard ever runs, so "/../package.json" already becomes the in-root
  // "/package.json" by the time we see it — a safe 200, not a traversal. Assert it is in
  // fact the repo's own package.json (never 200 with foreign content), and that it is never
  // outside-root data via a non-403/404, non-matching status.
  const res = await rawGet('/../package.json');
  expect([200, 403, 404]).toContain(res.statusCode);
  if (res.statusCode === 200) {
    expect(JSON.parse(res.body).name).toBe('@onestomedia/consent-banner');
  }
});

test('rejects a sibling-directory-prefix traversal, never serving foreign content', async () => {
  const rootName = root.split('/').pop();
  const res = await rawGet(`/..%2f${rootName}-x%2fa.txt`);
  expect([403, 404]).toContain(res.statusCode);
});

test('rejects a NUL byte in the decoded path with 400', async () => {
  const res = await rawGet('/%00');
  expect(res.statusCode).toBe(400);
});
