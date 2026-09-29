// Runs template/tests.yaml (the GTM template-editor tests) against template/code.js with a
// minimal emulation of the GTM test API (mock, runCode, assertApi), so the scenarios that ship
// inside om-consent.tpl are verified in CI and not only in the GTM UI.
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { parse } from 'yaml';

const code = readFileSync(new URL('../template/code.js', import.meta.url), 'utf8');
const suite = parse(readFileSync(new URL('../template/tests.yaml', import.meta.url), 'utf8'));

const DEFAULTS = {
  setDefaultConsentState: () => {}, updateConsentState: () => {}, getCookieValues: () => [],
  injectScript: () => {}, setInWindow: () => true, gtagSet: () => {}, logToConsole: () => {},
  makeNumber: (v) => Number(v), makeString: (v) => String(v),
};

function harness() {
  const mocks = {};
  const calls = {};
  const wrap = (name, fallback) => (...args) => {
    (calls[name] ||= []).push(args);
    return (mocks[name] || fallback)(...args);
  };
  const mock = (name, fn) => { mocks[name] = fn; };
  const runCode = (data) => {
    const full = { ...data, gtmOnSuccess: wrap('gtmOnSuccess', () => {}), gtmOnFailure: wrap('gtmOnFailure', () => {}) };
    const req = (n) => { if (!DEFAULTS[n]) throw new Error('unexpected require ' + n); return wrap(n, DEFAULTS[n]); };
    new Function('require', 'data', code)(req, full);
  };
  const assertApi = (name) => ({
    wasCalled: () => expect(calls[name], `${name} was called`).toBeDefined(),
    wasNotCalled: () => expect(calls[name], `${name} was not called`).toBeUndefined(),
    wasCalledWith: (...args) => expect((calls[name] || []).some((c) => isDeepStrictEqual(c, args)),
      `${name} called with ${JSON.stringify(args)}; got ${JSON.stringify(calls[name])}`).toBe(true),
  });
  return { mock, runCode, assertApi };
}

test('tests.yaml has scenarios', () => {
  expect(suite.scenarios.length).toBeGreaterThanOrEqual(7);
});

test.each(suite.scenarios.map((s) => [s.name, s]))('GTM scenario: %s', (_name, s) => {
  const { mock, runCode, assertApi } = harness();
  new Function('mock', 'runCode', 'assertApi', `${suite.setup}\n${s.code}`)(mock, runCode, assertApi);
});
