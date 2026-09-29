export const COOKIE_NAME = 'om_consent';

const state = (on) => (on ? 'granted' : 'denied');

export function categoriesToConsent({ analytics, marketing }) {
  return {
    analytics_storage: state(analytics),
    ad_storage: state(marketing),
    ad_user_data: state(marketing),
    ad_personalization: state(marketing),
  };
}

export function encodeCookie({ analytics, marketing, revision }) {
  return `r${revision}.a${analytics ? 1 : 0}.m${marketing ? 1 : 0}`;
}

const PATTERN = /^r([1-9]\d*)\.a([01])\.m([01])$/;

export function decodeCookie(value) {
  if (typeof value !== 'string') return null;
  const m = PATTERN.exec(value);
  if (!m) return null;
  return { analytics: m[2] === '1', marketing: m[3] === '1', revision: Number(m[1]) };
}
