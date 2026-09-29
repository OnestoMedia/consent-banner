import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import fixtures from './fixtures/cookies.json';

const code = readFileSync(new URL('../template/code.js', import.meta.url), 'utf8');

function run(data, { cookies = [], injectOk = true } = {}) {
  const calls = {};
  const outcome = {};
  const rec = (name, ret) => (...args) => { (calls[name] ||= []).push(args); return ret; };
  const apis = {
    setDefaultConsentState: rec('setDefaultConsentState'),
    updateConsentState: rec('updateConsentState'),
    // Like GTM: URL-decodes unless the second argument is false.
    getCookieValues: (...args) => {
      (calls.getCookieValues ||= []).push(args);
      return args[1] === false ? cookies.slice() : cookies.map((c) => decodeURIComponent(c));
    },
    setInWindow: rec('setInWindow', true),
    gtagSet: rec('gtagSet'),
    logToConsole: rec('logToConsole'),
    makeNumber: (v) => Number(v),
    makeString: (v) => String(v),
    injectScript: (url, ok, fail, cacheToken) => {
      (calls.injectScript ||= []).push([url, cacheToken]);
      outcome.successBeforeInject = outcome.success === true;
      (injectOk ? ok : fail)();
    },
  };
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
    expect(value).toMatchObject({ privacyUrl: 'https://x.nl/privacy', accent: '#077668', formal: 'u', revision: 1 });
    expect(overwrite).toBe(true);
  });
  test('revision "0" normalizes to 1 and still restores an r1 cookie', () => {
    const { calls } = run({ ...base, revision: '0' }, { cookies: ['r1.a1.m0'] });
    expect(calls.setInWindow[0][1].revision).toBe(1);
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted',
    });
  });
  test('revision "1.5" normalizes to 1 and still restores an r1 cookie', () => {
    const { calls } = run({ ...base, revision: '1.5' }, { cookies: ['r1.a1.m0'] });
    expect(calls.setInWindow[0][1].revision).toBe(1);
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted',
    });
  });
  test('revision "abc" normalizes to 1', () => {
    const { calls } = run({ ...base, revision: 'abc' });
    expect(calls.setInWindow[0][1].revision).toBe(1);
  });
  test('pinned version', () => {
    const { calls } = run({ ...base, version: '1.2.3' });
    expect(calls.injectScript[0][0]).toContain('consent-banner@1.2.3/');
  });
  test('tag completes before the script loads (does not wait for the CDN)', () => {
    const { calls, outcome } = run(base);
    expect(outcome.successBeforeInject).toBe(true);
    expect(calls.injectScript[0][1]).toBe('om-consent');
    expect(outcome.failure).toBeUndefined();
  });
  test('script load failure → still gtmOnSuccess, only logs, defaults stay denied', () => {
    const { calls, outcome } = run(base, { injectOk: false });
    expect(outcome.success).toBe(true);
    expect(outcome.failure).toBeUndefined();
    expect(calls.logToConsole).toHaveLength(1);
    expect(calls.logToConsole[0][0]).toContain('failed to load');
    expect(calls.setDefaultConsentState).toHaveLength(1);
    expect(calls.setDefaultConsentState[0][0]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
    expect(calls.updateConsentState).toBeUndefined();
  });
  test.each([['abc'], ['-5'], [''], [undefined]])('waitForUpdate %o falls back to 500', (w) => {
    const { calls } = run({ ...base, waitForUpdate: w });
    expect(calls.setDefaultConsentState[0][0].wait_for_update).toBe(500);
  });
  test('waitForUpdate "0" is kept', () => {
    const { calls } = run({ ...base, waitForUpdate: '0' });
    expect(calls.setDefaultConsentState[0][0].wait_for_update).toBe(0);
  });
  test('reads om_consent raw (no URL-decoding)', () => {
    const { calls } = run(base);
    expect(calls.getCookieValues[0]).toEqual(['om_consent', false]);
  });
  test('duplicate cookies: a revocation in any copy wins', () => {
    const { calls } = run(base, { cookies: ['r1.a1.m1', 'r1.a0.m0'] });
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
    });
  });
  test('duplicate cookies: order does not matter', () => {
    const { calls } = run(base, { cookies: ['r1.a0.m1', 'r1.a1.m1'] });
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'denied',
    });
  });
  test('duplicate cookies: invalid copies are ignored', () => {
    const { calls } = run(base, { cookies: ['r1.a1.m0', 'rX'] });
    expect(calls.updateConsentState[0][0]).toEqual({
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted',
    });
  });
  test('duplicate cookies: stale-revision copies are ignored', () => {
    const { calls } = run({ ...base, revision: '2' }, { cookies: ['r1.a0.m0', 'r2.a1.m1'] });
    expect(calls.updateConsentState[0][0]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted' });
  });
  test('duplicate cookies: no valid copy → no restore', () => {
    const { calls } = run({ ...base, revision: '2' }, { cookies: ['r1.a1.m1', 'garbage'] });
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
  // setInWindow(key, value, true) needs read AND write on the key in real GTM ("Prohibited readwrite").
  const globals = JSON.parse(block('WEB_PERMISSIONS')).find((p) => p.instance.key.publicId === 'access_globals');
  const entry = globals.instance.param[0].value.listItem[0];
  const flags = Object.fromEntries(entry.mapKey.map((k, i) => [k.string, entry.mapValue[i].boolean ?? entry.mapValue[i].string]));
  expect(flags).toMatchObject({ key: 'omConsentConfig', read: true, write: true, execute: false });
});
