import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
await build({
  entryPoints: ['src/index.js'],
  bundle: true, minify: true, format: 'iife', target: ['es2018'],
  loader: { '.css': 'text' },
  define: { __VERSION__: JSON.stringify(version) },
  banner: { js: `/*! OnestoMedia Consent v${version} | MIT | includes CookieConsent v3 (c) Orest Bida, MIT */` },
  outfile: 'dist/om-consent.min.js',
});
console.log('built dist/om-consent.min.js', version);
