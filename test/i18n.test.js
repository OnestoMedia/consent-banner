import { describe, test, expect } from 'vitest';
import { pickLanguage, buildTranslation, SUPPORTED } from '../src/i18n.js';

describe('pickLanguage', () => {
  test.each([
    ['nl', 'en', 'nl'], ['nl-NL', 'en', 'nl'], ['NL-be', 'en', 'nl'], ['de_AT', 'en', 'de'],
    ['fr-BE', 'en', 'fr'], ['en-GB', 'nl', 'en'], ['pt-BR', 'en', 'en'], ['pt-BR', 'de', 'de'],
    ['', 'nl', 'nl'], [undefined, 'fr', 'fr'], ['es', 'xx', 'en'],
  ])('%s with fallback %s → %s', (lang, fb, want) => {
    expect(pickLanguage(lang, fb)).toBe(want);
  });
});

describe('buildTranslation', () => {
  test('every language has all keys CookieConsent needs', () => {
    for (const lang of SUPPORTED) {
      const t = buildTranslation(lang, 'je', 'https://example.com/privacy');
      for (const k of ['title', 'description', 'acceptAllBtn', 'acceptNecessaryBtn', 'showPreferencesBtn', 'footer']) {
        expect(t.consentModal[k], `${lang}.consentModal.${k}`).toBeTruthy();
      }
      for (const k of ['title', 'acceptAllBtn', 'acceptNecessaryBtn', 'savePreferencesBtn', 'closeIconLabel']) {
        expect(t.preferencesModal[k], `${lang}.preferencesModal.${k}`).toBeTruthy();
      }
      const linked = t.preferencesModal.sections.map((s) => s.linkedCategory).filter(Boolean);
      expect(linked).toEqual(['necessary', 'analytics', 'marketing']);
    }
  });
  test('Dutch je/u', () => {
    expect(buildTranslation('nl', 'je', 'https://x.nl/p').consentModal.description).toContain('jouw toestemming');
    expect(buildTranslation('nl', 'u', 'https://x.nl/p').consentModal.description).toContain('uw toestemming');
    expect(buildTranslation('nl', 'u', 'https://x.nl/p').preferencesModal.sections[0].description).toContain('u toestaat');
  });
  test('privacy link in footer, escaped', () => {
    const t = buildTranslation('en', 'je', 'https://x.nl/p?a=1&b="2"');
    expect(t.consentModal.footer).toBe('<a href="https://x.nl/p?a=1&amp;b=&quot;2&quot;" target="_blank" rel="noopener">Privacy policy</a>');
  });
  test('no privacy URL → no footer link', () => {
    expect(buildTranslation('en', 'je', '').consentModal.footer).toBe('');
  });
});
