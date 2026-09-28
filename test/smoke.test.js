import { test, expect } from 'vitest';
import * as CookieConsent from 'vanilla-cookieconsent';

test('vendor library is installed', () => {
  expect(typeof CookieConsent.run).toBe('function');
});
