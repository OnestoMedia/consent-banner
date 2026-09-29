import { describe, test, expect } from 'vitest';
import fixtures from './fixtures/cookies.json';
import { categoriesToConsent, encodeCookie, decodeCookie, COOKIE_NAME } from '../src/consent.js';

describe('categoriesToConsent', () => {
  test('nothing accepted → all denied', () => {
    expect(categoriesToConsent({ analytics: false, marketing: false })).toEqual({
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
  });
  test('analytics only', () => {
    expect(categoriesToConsent({ analytics: true, marketing: false })).toEqual({
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
  });
  test('marketing grants all three ad types', () => {
    expect(categoriesToConsent({ analytics: false, marketing: true })).toEqual({
      analytics_storage: 'denied', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
    });
  });
});

describe('cookie', () => {
  test('name', () => expect(COOKIE_NAME).toBe('om_consent'));
  test('encode', () => {
    expect(encodeCookie({ analytics: true, marketing: false, revision: 1 })).toBe('r1.a1.m0');
    expect(encodeCookie({ analytics: false, marketing: true, revision: 7 })).toBe('r7.a0.m1');
  });
  test.each(fixtures)('decode %o', ({ value, expected }) => {
    expect(decodeCookie(value)).toEqual(expected);
  });
  test('decode undefined/null', () => {
    expect(decodeCookie(undefined)).toBeNull();
    expect(decodeCookie(null)).toBeNull();
  });
  test('round trip', () => {
    const c = { analytics: false, marketing: true, revision: 4 };
    expect(decodeCookie(encodeCookie(c))).toEqual(c);
  });
});
