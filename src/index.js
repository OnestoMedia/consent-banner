import * as CookieConsent from 'vanilla-cookieconsent';
import vendorCss from 'vanilla-cookieconsent/dist/cookieconsent.css';
import ownCss from './om-consent.css';
import { normalizeConfig, buildRunOptions } from './config.js';
import { themeVars } from './theme.js';
import { categoriesToConsent, encodeCookie, decodeCookie, COOKIE_NAME } from './consent.js';

const VERSION = typeof __VERSION__ === 'string' ? __VERSION__ : 'dev';

function readCookie(doc) {
  const hit = doc.cookie.split('; ').find((c) => c.startsWith(COOKIE_NAME + '='));
  return hit ? decodeCookie(hit.slice(COOKIE_NAME.length + 1)) : null;
}

function writeCookie(doc, win, value, config) {
  let s = `${COOKIE_NAME}=${value}; Max-Age=${config.expiresDays * 86400}; Path=/; SameSite=Lax`;
  if (config.cookieDomain) s += `; Domain=${config.cookieDomain}`;
  if (win.location && win.location.protocol === 'https:') s += '; Secure';
  doc.cookie = s;
}

function injectStyle(doc, css) {
  const el = doc.createElement('style');
  el.id = 'om-consent-style';
  el.textContent = css;
  doc.head.appendChild(el);
}

export function start(win = window, doc = document) {
  if (win.omConsent && win.omConsent.started) return win.omConsent;
  const config = normalizeConfig(win.omConsentConfig || {}, doc.documentElement.lang);
  injectStyle(doc, `${vendorCss}\n${ownCss}\n${themeVars(config)}`);
  doc.documentElement.classList.add(config.weight === 'accept' ? 'omc-accept' : 'omc-equal');

  const apply = () => {
    const choice = {
      analytics: CookieConsent.acceptedCategory('analytics'),
      marketing: CookieConsent.acceptedCategory('marketing'),
      revision: config.revision,
    };
    win.dataLayer = win.dataLayer || [];
    const gtag = function () { win.dataLayer.push(arguments); };
    gtag('consent', 'update', categoriesToConsent(choice));
    win.dataLayer.push({ event: 'om_consent_update', om_consent: { ...choice } });
    writeCookie(doc, win, encodeCookie(choice), config);
  };
  // om_cc (CookieConsent) is the source of truth for the choice; om_consent is what the GTM
  // template reads on the next page. Re-apply when om_consent is missing, stale, or disagrees.
  const repairIfOutOfSync = () => {
    const stored = readCookie(doc);
    if (!stored || stored.revision !== config.revision
      || stored.analytics !== CookieConsent.acceptedCategory('analytics')
      || stored.marketing !== CookieConsent.acceptedCategory('marketing')) apply();
  };

  // With a cookie domain, host-only copies left from before (e.g. the domain was set later)
  // would shadow the domain cookies: readers take the first value, so a newer choice could be
  // ignored. Expire the host-only copies (no Domain attribute) before CookieConsent reads om_cc.
  if (config.cookieDomain) {
    for (const name of [COOKIE_NAME, 'om_cc']) doc.cookie = `${name}=; Max-Age=0; Path=/`;
  }

  // vanilla-cookieconsent guards re-init with a flag on `win`, not on its own module
  // state. In a real browser that's fine (`start()` runs once per page load), but it
  // means a stale flag from a previous run in the same `win` would silently skip all
  // setup. `win.omConsent.started` (checked above) is our own single source of truth
  // for "already booted in this window", so anything short of that should get a clean
  // slate before `run()`.
  CookieConsent.reset();
  // Never break the host page: consent simply stays as the template set it (denied or
  // restored). run() is async, so catch both a synchronous throw and a rejection.
  const failed = (e) => console.error('[om-consent] banner failed to start, consent left unchanged', e);
  try {
    const running = CookieConsent.run(buildRunOptions(config, { onFirstConsent: apply, onChange: apply, onConsent: repairIfOutOfSync }));
    if (running && typeof running.catch === 'function') running.catch(failed);
  } catch (e) {
    failed(e);
  }

  doc.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('[data-om-consent-open]') : null;
    if (t) { e.preventDefault(); CookieConsent.showPreferences(); }
  });

  win.omConsent = { started: true, version: VERSION, show: () => CookieConsent.showPreferences() };
  return win.omConsent;
}

if (typeof window !== 'undefined' && !window.__OM_CONSENT_NO_AUTOSTART__) start(window, document);
