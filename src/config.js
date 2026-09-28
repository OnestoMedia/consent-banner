import { pickLanguage, buildTranslation } from './i18n.js';

export const DEFAULTS = {
  privacyUrl: '', formal: 'je', fallbackLang: 'en',
  accent: '#2D6A4F', bg: '#FFFFFF', text: '#1A1A1A', radius: 12, font: '',
  layout: 'bar', weight: 'accept', cookieDomain: '', expiresDays: 365, revision: 1,
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const ONE_OF = { layout: ['bar', 'card', 'modal'], weight: ['accept', 'equal'], formal: ['je', 'u'] };

const toInt = (v) => (typeof v === 'number' ? v : /^\s*-?\d+\s*$/.test(String(v)) ? parseInt(v, 10) : NaN);

export function normalizeConfig(raw = {}, htmlLang, warn = console.warn) {
  const c = { ...DEFAULTS };
  const bad = (field, value) => warn(`[om-consent] invalid ${field}: ${JSON.stringify(value)} — using default`);

  if (typeof raw.privacyUrl === 'string' && raw.privacyUrl.trim()) c.privacyUrl = raw.privacyUrl.trim();
  else warn('[om-consent] privacyUrl is empty — banner shows no privacy link');

  for (const k of ['accent', 'bg', 'text']) {
    if (raw[k] === undefined || raw[k] === '') continue;
    if (HEX.test(String(raw[k]))) c[k] = String(raw[k]); else bad(k, raw[k]);
  }
  for (const k of Object.keys(ONE_OF)) {
    if (raw[k] === undefined || raw[k] === '') continue;
    if (ONE_OF[k].includes(raw[k])) c[k] = raw[k]; else bad(k, raw[k]);
  }
  const ints = { radius: [0, 24], expiresDays: [1, 395], revision: [1, Infinity] };
  for (const [k, [min, max]] of Object.entries(ints)) {
    if (raw[k] === undefined || raw[k] === '') continue;
    const n = toInt(raw[k]);
    if (Number.isNaN(n) || n < min) { bad(k, raw[k]); continue; }
    c[k] = Math.min(n, max);
  }
  if (typeof raw.font === 'string') c.font = raw.font.trim();
  if (typeof raw.cookieDomain === 'string') c.cookieDomain = raw.cookieDomain.trim();
  if (typeof raw.fallbackLang === 'string' && raw.fallbackLang) c.fallbackLang = raw.fallbackLang;
  c.lang = pickLanguage(htmlLang, c.fallbackLang);
  return c;
}

const LAYOUTS = {
  bar: { layout: 'bar inline', position: 'bottom' },
  card: { layout: 'box', position: 'bottom left' },
  modal: { layout: 'box', position: 'middle center' },
};

export function buildRunOptions(config, { onFirstConsent, onConsent, onChange }) {
  const cookie = { name: 'om_cc', expiresAfterDays: config.expiresDays, sameSite: 'Lax' };
  if (config.cookieDomain) cookie.domain = config.cookieDomain;
  return {
    mode: 'opt-in',
    revision: config.revision,
    autoShow: true,
    disablePageInteraction: config.layout === 'modal',
    cookie,
    guiOptions: {
      consentModal: { ...LAYOUTS[config.layout], equalWeightButtons: config.weight === 'equal', flipButtons: false },
      preferencesModal: { layout: 'box', equalWeightButtons: true, flipButtons: false },
    },
    categories: { necessary: { enabled: true, readOnly: true }, analytics: {}, marketing: {} },
    language: {
      default: config.lang,
      translations: { [config.lang]: buildTranslation(config.lang, config.formal, config.privacyUrl) },
    },
    onFirstConsent, onConsent, onChange,
  };
}
