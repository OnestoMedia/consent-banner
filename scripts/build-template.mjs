import { readFileSync, writeFileSync } from 'node:fs';
import permissions from '../template/permissions.mjs';

const read = (p) => readFileSync(new URL(`../template/${p}`, import.meta.url), 'utf8').trim();
const TOS = `By creating or modifying this file you agree to Google Tag Manager's Community
Template Gallery Developer Terms of Service available at
https://developers.google.com/tag-manager/gallery-tos (or such other URL as
Google may provide), as modified from time to time.`;
const section = (name, body) => `___${name}___\n\n${body}\n\n\n`;

const tpl =
  section('TERMS_OF_SERVICE', TOS) +
  section('INFO', JSON.stringify(JSON.parse(read('info.json')), null, 2)) +
  section('TEMPLATE_PARAMETERS', JSON.stringify(JSON.parse(read('params.json')), null, 2)) +
  section('SANDBOXED_JS_FOR_WEB_TEMPLATE', read('code.js')) +
  section('WEB_PERMISSIONS', JSON.stringify(permissions, null, 2)) +
  section('TESTS', read('tests.yaml')) +
  section('NOTES', 'Built by scripts/build-template.mjs — edit the sources in template/, not this file.');

writeFileSync(new URL('../template/om-consent.tpl', import.meta.url), tpl);
console.log('wrote template/om-consent.tpl');
