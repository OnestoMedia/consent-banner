import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import fixtures from './fixtures/cookies.json';

const code = readFileSync(new URL('../template/code.js', import.meta.url), 'utf8');

function run(data, { cookies = [], injectOk = true } = {}) {
  const calls = {};
  const rec = (name, ret) => (...args) => { (calls[name] ||= []).push(args); return ret; };
  const apis = {
    setDefaultConsentState: rec('setDefaultConsentState'),
    updateConsentState: rec('updateConsentState'),
    getCookieValues: rec('getCookieValues', cookies),
    setInWindow: rec('setInWindow', true),
    gtagSet: rec('gtagSet'),
    logToConsole: rec('logToConsole'),
    makeNumber: (v) => Number(v),
    makeString: (v) => String(v),
    injectScript: (url, ok, fail) => { (calls.injectScript ||= []).push([url]); (injectOk ? ok : fail)(); },
  };
  const outcome = {};
  const full = { gtmOnSuccess: () => (outcome.success = true), gtmOnFailure: () => (outcome.failure = true), ...data };
  new Function('require', 'data', code)((n) => { if (!apis[n]) throw new Error('unexpected require ' + n); return apis[n]; }, full);
  return { calls, outcome };
}

const base = { privacyUrl: 'https://x.nl/privacy', revision: '1', waitForUpdate: '500', version: '1', adsDataRedaction: true };

describe('template code', () => {
  test('sets denied defaults with wait_for_update and redaction', () => {
    const { calls, outcome } = run(base);
    expect(calls.setDefaultConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
      functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500,
    });
    expect(calls.gtagSet[0]).toEqual(['ads_data_redaction', true]);
    expect(calls.updateConsentState).toBeUndefined();
    expect(calls.injectScript[0][0]).toBe('https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@1/dist/om-consent.min.js');
    expect(outcome.success).toBe(true);
  });
  test('regions list', () => {
    const { calls } = run({ ...base, regions: 'NL, BE ,DE' });
    expect(calls.setDefaultConsentState[0][0].region).toEqual(['NL', 'BE', 'DE']);
  });
  test('restores a stored choice', () => {
    const { calls } = run(base, { cookies: ['r1.a1.m0'] });
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted',
    });
  });
  test('older revision is ignored', () => {
    const { calls } = run({ ...base, revision: '2' }, { cookies: ['r1.a1.m1'] });
    expect(calls.updateConsentState).toBeUndefined();
  });
  test.each(fixtures.filter((f) => f.expected === null))('malformed cookie %o is ignored', ({ value }) => {
    const { calls } = run(base, { cookies: [value] });
    expect(calls.updateConsentState).toBeUndefined();
  });
  test('passes config to window', () => {
    const { calls } = run({ ...base, accent: '#077668', layout: 'bar', weight: 'accept', formal: 'u' });
    const [key, value, overwrite] = calls.setInWindow[0];
    expect(key).toBe('omConsentConfig');
    expect(value).toMatchObject({ privacyUrl: 'https://x.nl/privacy', accent: '#077668', formal: 'u', revision: '1' });
    expect(overwrite).toBe(true);
  });
  test('pinned version', () => {
    const { calls } = run({ ...base, version: '1.2.3' });
    expect(calls.injectScript[0][0]).toContain('consent-banner@1.2.3/');
  });
  test('script load failure → gtmOnFailure, defaults stay denied', () => {
    const { calls, outcome } = run(base, { injectOk: false });
    expect(outcome.failure).toBe(true);
    expect(calls.setDefaultConsentState).toHaveLength(1);
    expect(calls.updateConsentState).toBeUndefined();
  });
  test('invalid version string falls back to 1', () => {
    const { calls } = run({ ...base, version: '../evil' });
    expect(calls.injectScript[0][0]).toContain('consent-banner@1/');
  });
});

test('assembled .tpl has every section and valid JSON blocks', () => {
  execFileSync('node', ['scripts/build-template.mjs']);
  const tpl = readFileSync(new URL('../template/om-consent.tpl', import.meta.url), 'utf8');
  for (const s of ['TERMS_OF_SERVICE', 'INFO', 'TEMPLATE_PARAMETERS', 'SANDBOXED_JS_FOR_WEB_TEMPLATE', 'WEB_PERMISSIONS', 'TESTS', 'NOTES']) {
    expect(tpl).toContain(`___${s}___`);
  }
  const block = (name) => tpl.split(`___${name}___`)[1].split('\n\n\n___')[0].trim();
  expect(() => JSON.parse(block('INFO'))).not.toThrow();
  const params = JSON.parse(block('TEMPLATE_PARAMETERS'));
  const names = params.flatMap((g) => g.subParams.map((p) => p.name));
  expect(names).toEqual(['privacyUrl', 'formal', 'fallbackLang', 'accent', 'bg', 'text', 'radius', 'font', 'layout', 'weight', 'regions', 'waitForUpdate', 'adsDataRedaction', 'cookieDomain', 'expiresDays', 'revision', 'version']);
  expect(JSON.parse(block('WEB_PERMISSIONS')).map((p) => p.instance.key.publicId)).toContain('inject_script');
});
