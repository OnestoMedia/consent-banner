import { describe, test, expect, vi } from 'vitest';
import { normalizeConfig, buildRunOptions, DEFAULTS } from '../src/config.js';

describe('normalizeConfig', () => {
  test('defaults', () => {
    const warn = vi.fn();
    const c = normalizeConfig({ privacyUrl: 'https://x.nl/privacy' }, 'nl-NL', warn);
    expect(c).toMatchObject({ ...DEFAULTS, privacyUrl: 'https://x.nl/privacy', lang: 'nl' });
    expect(c.layout).toBe('bar');
    expect(c.weight).toBe('accept');
    expect(c.radius).toBe(12);
    expect(c.revision).toBe(1);
    expect(c.expiresDays).toBe(365);
    expect(warn).not.toHaveBeenCalled();
  });
  test('misfilled fields fall back to defaults and warn once per field', () => {
    const warn = vi.fn();
    const c = normalizeConfig({ privacyUrl: '', accent: 'green', bg: '#12', radius: 'abc', layout: 'popup', weight: 'loud', revision: '0', formal: 'Sie' }, 'en', warn);
    expect(c.accent).toBe(DEFAULTS.accent);
    expect(c.bg).toBe(DEFAULTS.bg);
    expect(c.radius).toBe(12);
    expect(c.layout).toBe('bar');
    expect(c.weight).toBe('accept');
    expect(c.revision).toBe(1);
    expect(c.formal).toBe('je');
    const fields = warn.mock.calls.map((a) => a[0]);
    expect(fields.join(' ')).toMatch(/privacyUrl/);
    for (const f of ['accent', 'bg', 'radius', 'layout', 'weight', 'revision', 'formal']) {
      expect(fields.join(' ')).toContain(f);
    }
  });
  test('numbers as strings from GTM are accepted', () => {
    const c = normalizeConfig({ privacyUrl: 'https://x', radius: '8', revision: '3', expiresDays: '180' }, 'en', () => {});
    expect(c).toMatchObject({ radius: 8, revision: 3, expiresDays: 180 });
  });
  test('radius and expiry are clamped', () => {
    const c = normalizeConfig({ privacyUrl: 'https://x', radius: 99, expiresDays: 9999 }, 'en', () => {});
    expect(c.radius).toBe(24);
    expect(c.expiresDays).toBe(395);
  });
  test('3-digit hex is accepted', () => {
    expect(normalizeConfig({ privacyUrl: 'https://x', accent: '#0a0' }, 'en', () => {}).accent).toBe('#0a0');
  });
});

describe('buildRunOptions', () => {
  const cb = { onFirstConsent() {}, onConsent() {}, onChange() {} };
  const base = normalizeConfig({ privacyUrl: 'https://x.nl/p' }, 'nl', () => {});
  test('bar + accept weight', () => {
    const o = buildRunOptions(base, cb);
    expect(o.mode).toBe('opt-in');
    expect(o.revision).toBe(1);
    expect(o.guiOptions.consentModal).toMatchObject({ layout: 'bar inline', position: 'bottom', equalWeightButtons: false });
    expect(o.disablePageInteraction).toBe(false);
    expect(o.categories).toEqual({ necessary: { enabled: true, readOnly: true }, analytics: {}, marketing: {} });
    expect(o.cookie).toEqual({ name: 'om_cc', expiresAfterDays: 365, sameSite: 'Lax' });
    expect(o.language.default).toBe('nl');
    expect(Object.keys(o.language.translations)).toEqual(['nl']);
    expect(o.onFirstConsent).toBe(cb.onFirstConsent);
  });
  test('card, modal, equal, domain', () => {
    const card = buildRunOptions({ ...base, layout: 'card' }, cb);
    expect(card.guiOptions.consentModal).toMatchObject({ layout: 'box', position: 'bottom left' });
    const modal = buildRunOptions({ ...base, layout: 'modal', weight: 'equal', cookieDomain: '.x.nl' }, cb);
    expect(modal.guiOptions.consentModal).toMatchObject({ layout: 'box', position: 'middle center', equalWeightButtons: true });
    expect(modal.disablePageInteraction).toBe(true);
    expect(modal.cookie.domain).toBe('.x.nl');
  });
});
