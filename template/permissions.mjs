const str = (s) => ({ type: 1, string: s });
const bool = (b) => ({ type: 8, boolean: b });
const list = (items) => ({ type: 2, listItem: items });
const map = (obj) => ({ type: 3, mapKey: Object.keys(obj).map(str), mapValue: Object.values(obj) });
const perm = (publicId, params) => ({
  instance: { key: { publicId, versionId: '1' }, param: Object.entries(params).map(([key, value]) => ({ key, value })) },
  clientAnnotations: { isEditedByUser: true },
  isRequired: true,
});
const CONSENT_TYPES = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage', 'functionality_storage', 'security_storage'];

export default [
  perm('access_consent', { consentTypes: list(CONSENT_TYPES.map((t) => map({ consentType: str(t), read: bool(true), write: bool(true) }))) }),
  perm('get_cookies', { cookieAccess: str('specific'), cookieNames: list([str('om_consent')]) }),
  perm('inject_script', { urls: list([str('https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@*')]) }),
  perm('access_globals', { keys: list([map({ key: str('omConsentConfig'), read: bool(false), write: bool(true), execute: bool(false) })]) }),
  perm('write_data_layer', { keyPatterns: list([str('ads_data_redaction')]) }),
  perm('logging', { environments: str('debug') }),
];
