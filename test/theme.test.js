import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { contrastRatio, inkOn, mix, themeVars } from '../src/theme.js';
import { normalizeConfig } from '../src/config.js';

const require = createRequire(import.meta.url);
const vendorCss = readFileSync(require.resolve('vanilla-cookieconsent/dist/cookieconsent.css'), 'utf8');

describe('colour helpers', () => {
  test('contrast black/white = 21', () => expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0));
  test('ink on forest is white, on fern-pale is dark', () => {
    expect(inkOn('#2D6A4F')).toBe('#FFFFFF');
    expect(inkOn('#E8F5EE')).toBe('#111111');
  });
  test('mix', () => expect(mix('#000000', '#FFFFFF', 0.5).toLowerCase()).toBe('#808080'));
  test('3-digit hex', () => expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 0));
});

describe('themeVars', () => {
  const c = normalizeConfig({ privacyUrl: 'https://x', accent: '#077668', text: '#344744', radius: 6, font: 'Open Sans' }, 'nl', () => {});
  const css = themeVars(c);
  test('sets the brand values', () => {
    expect(css).toContain('--cc-btn-primary-bg:#077668');
    expect(css).toContain('--cc-primary-color:#344744');
    expect(css).toContain('--cc-modal-border-radius:6px');
    expect(css).toContain('--cc-font-family:"Open Sans"');
  });
  test('empty font inherits', () => {
    expect(themeVars({ ...c, font: '' })).toContain('--cc-font-family:inherit');
  });
  test('every variable we set exists in the vendor CSS', () => {
    const ours = [...css.matchAll(/(--cc-[a-z0-9-]+):/g)].map((m) => m[1]);
    expect(ours.length).toBeGreaterThan(10);
    for (const v of ours) expect(vendorCss, v).toContain(v);
  });
});
