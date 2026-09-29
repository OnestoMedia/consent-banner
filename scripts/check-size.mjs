import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const LIMIT = 30 * 1024;
const size = gzipSync(readFileSync('dist/om-consent.min.js')).length;
console.log(`om-consent.min.js: ${(size / 1024).toFixed(1)} KB gzip (limit 30 KB)`);
if (size > LIMIT) { console.error('over budget'); process.exit(1); }
