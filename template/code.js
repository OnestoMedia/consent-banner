const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const getCookieValues = require('getCookieValues');
const injectScript = require('injectScript');
const setInWindow = require('setInWindow');
const gtagSet = require('gtagSet');
const makeNumber = require('makeNumber');
const makeString = require('makeString');
const log = require('logToConsole');

function stateFor(analytics, marketing) {
  return {
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied'
  };
}

function isDigits(s) {
  if (!s || s.length === 0) return false;
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (c < '0' || c > '9') return false;
  }
  return true;
}

// "r<rev>.a<0|1>.m<0|1>" → {revision, analytics, marketing} or null
function decode(value) {
  var parts = makeString(value).split('.');
  if (parts.length !== 3) return null;
  if (parts[0].charAt(0) !== 'r' || parts[1].charAt(0) !== 'a' || parts[2].charAt(0) !== 'm') return null;
  var rev = parts[0].substring(1);
  var a = parts[1].substring(1);
  var m = parts[2].substring(1);
  if (!isDigits(rev) || rev.charAt(0) === '0') return null;
  if ((a !== '0' && a !== '1') || (m !== '0' && m !== '1')) return null;
  return { revision: makeNumber(rev), analytics: a === '1', marketing: m === '1' };
}

function isVersion(v) {
  var parts = makeString(v).split('.');
  if (parts.length > 3) return false;
  for (var i = 0; i < parts.length; i++) if (!isDigits(parts[i])) return false;
  return true;
}

// Same grammar as src/config.js normalizeConfig: digits only, no leading zero, else 1.
function normalizeRevision(v) {
  var s = makeString(v || '');
  if (isDigits(s) && s.charAt(0) !== '0') return makeNumber(s);
  return 1;
}

var revision = normalizeRevision(data.revision);

var defaults = stateFor(false, false);
defaults.functionality_storage = 'granted';
defaults.security_storage = 'granted';
defaults.wait_for_update = makeNumber(data.waitForUpdate || 500);
if (data.regions) {
  var regions = [];
  var raw = makeString(data.regions).split(',');
  for (var i = 0; i < raw.length; i++) {
    var r = raw[i].trim();
    if (r.length > 0) regions.push(r);
  }
  if (regions.length > 0) defaults.region = regions;
}
setDefaultConsentState(defaults);
if (data.adsDataRedaction !== false) gtagSet('ads_data_redaction', true);

var stored = getCookieValues('om_consent');
var prev = stored && stored.length > 0 ? decode(stored[0]) : null;
if (prev && prev.revision >= revision) {
  updateConsentState(stateFor(prev.analytics, prev.marketing));
}

setInWindow('omConsentConfig', {
  privacyUrl: data.privacyUrl, formal: data.formal, fallbackLang: data.fallbackLang,
  accent: data.accent, bg: data.bg, text: data.text, radius: data.radius, font: data.font,
  layout: data.layout, weight: data.weight, cookieDomain: data.cookieDomain,
  expiresDays: data.expiresDays, revision: revision
}, true);

var version = data.version && isVersion(data.version) ? makeString(data.version) : '1';
var url = 'https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@' + version + '/dist/om-consent.min.js';
injectScript(url, data.gtmOnSuccess, function () {
  log('OnestoMedia Consent: script failed to load, consent stays denied', url);
  data.gtmOnFailure();
}, 'om-consent');
