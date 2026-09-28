// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest';

const flush = () => new Promise((r) => setTimeout(r, 50));
const cookie = (name) => document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1];
const consentUpdates = () => window.dataLayer.filter((e) => e && e[0] === 'consent' && e[1] === 'update');

async function boot(cfg = {}) {
  window.__OM_CONSENT_NO_AUTOSTART__ = true;
  vi.resetModules();
  document.documentElement.lang = 'nl';
  window.dataLayer = [];
  window.omConsentConfig = { privacyUrl: 'https://x.nl/privacy', ...cfg };
  const { start } = await import('../src/index.js');
  const api = start(window, document);
  await flush();
  return api;
}

beforeEach(() => {
  document.cookie.split('; ').forEach((c) => { document.cookie = c.split('=')[0] + '=; Max-Age=0; Path=/'; });
  document.body.innerHTML = '<a href="#" data-om-consent-open id="open">Cookie-instellingen</a>';
  document.getElementById('cc-main')?.remove();
  delete window.omConsent;
});

describe('first visit', () => {
  test('shows the bar with Dutch copy and a reject button', async () => {
    await boot();
    const main = document.getElementById('cc-main');
    expect(main.textContent).toContain('Cookies op deze site');
    expect(main.querySelector('.cm__btn[data-role="necessary"]').textContent).toContain('Alles weigeren');
    expect(document.documentElement.classList.contains('omc-accept')).toBe(true);
  });
  test('accept all → consent update granted, event, cookie', async () => {
    await boot();
    document.querySelector('#cc-main .cm__btn[data-role="all"]').click();
    await flush();
    expect(consentUpdates().at(-1)[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted' });
    expect(window.dataLayer.find((e) => e.event === 'om_consent_update').om_consent).toEqual({ analytics: true, marketing: true, revision: 1 });
    expect(cookie('om_consent')).toBe('r1.a1.m1');
  });
  test('reject all → denied, cookie r1.a0.m0', async () => {
    await boot();
    document.querySelector('#cc-main .cm__btn[data-role="necessary"]').click();
    await flush();
    expect(consentUpdates().at(-1)[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
    expect(cookie('om_consent')).toBe('r1.a0.m0');
  });
});

describe('robustness', () => {
  test('starting twice keeps one banner', async () => {
    const api = await boot();
    const { start } = await import('../src/index.js');
    expect(start(window, document)).toBe(api);
    expect(document.querySelectorAll('#cc-main').length).toBe(1);
  });
  test('om_cc present but om_consent missing → repaired on load', async () => {
    await boot();
    document.querySelector('#cc-main .cm__btn[data-role="all"]').click();
    await flush();
    document.cookie = 'om_consent=; Max-Age=0; Path=/';
    document.getElementById('cc-main')?.remove();
    delete window.omConsent;
    await boot();
    expect(cookie('om_consent')).toBe('r1.a1.m1');
    expect(consentUpdates().at(-1)[2]).toMatchObject({ analytics_storage: 'granted' });
  });
  test('data-om-consent-open opens preferences', async () => {
    await boot();
    document.getElementById('open').click();
    await flush();
    expect(document.querySelector('#cc-main .pm')).not.toBeNull();
    expect(document.documentElement.classList.contains('show--preferences')).toBe(true);
  });
});
