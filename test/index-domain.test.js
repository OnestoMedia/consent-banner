// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://www.klant.nl/" }
import { test, expect, beforeEach, vi } from 'vitest';

const flush = () => new Promise((r) => setTimeout(r, 50));
const values = (name) => document.cookie.split('; ').filter((c) => c.startsWith(name + '=')).map((c) => c.slice(name.length + 1));

async function boot(cfg = {}) {
  window.__OM_CONSENT_NO_AUTOSTART__ = true;
  vi.resetModules();
  document.documentElement.lang = 'nl';
  window.dataLayer = [];
  window.omConsentConfig = { privacyUrl: 'https://x.nl/privacy', ...cfg };
  const { start } = await import('../src/index.js');
  start(window, document);
  await flush();
}

const reload = () => { document.getElementById('cc-main')?.remove(); delete window.omConsent; };

beforeEach(() => {
  for (const name of ['om_consent', 'om_cc']) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.klant.nl`;
  }
  reload();
});

test('cookieDomain set → host-only om_consent/om_cc from before are expired, domain copy kept', async () => {
  document.cookie = 'om_consent=r1.a1.m1; Path=/';
  document.cookie = 'om_consent=r1.a0.m0; Path=/; Domain=.klant.nl';
  expect(values('om_consent')).toHaveLength(2);
  await boot({ cookieDomain: '.klant.nl' });
  expect(values('om_consent')).toEqual(['r1.a0.m0']);
});

test('domain change after an accept: old host-only choice cannot shadow the new one', async () => {
  await boot();
  document.querySelector('#cc-main .cm__btn[data-role="all"]').click();
  await flush();
  expect(values('om_consent')).toEqual(['r1.a1.m1']);
  expect(values('om_cc')).toHaveLength(1);

  reload();
  await boot({ cookieDomain: '.klant.nl' });
  // host-only om_cc is gone, so the banner asks again
  expect(document.querySelector('#cc-main .cm')).not.toBeNull();
  document.querySelector('#cc-main .cm__btn[data-role="necessary"]').click();
  await flush();
  expect(values('om_consent')).toEqual(['r1.a0.m0']);
  expect(values('om_cc')).toHaveLength(1);
});

test('no cookieDomain → host-only cookies are left alone', async () => {
  document.cookie = 'om_consent=r1.a1.m1; Path=/';
  await boot();
  expect(values('om_consent')).toEqual(['r1.a1.m1']);
});
