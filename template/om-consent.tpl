___TERMS_OF_SERVICE___

By creating or modifying this file you agree to Google Tag Manager's Community
Template Gallery Developer Terms of Service available at
https://developers.google.com/tag-manager/gallery-tos (or such other URL as
Google may provide), as modified from time to time.


___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "OnestoMedia Consent",
  "categories": [
    "UTILITY"
  ],
  "brand": {
    "id": "brand_dummy",
    "displayName": "OnestoMedia"
  },
  "description": "Consentbanner (Consent Mode v2, advanced). Vuurt op Consent Initialization – All Pages.",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "GROUP",
    "name": "grpClient",
    "displayName": "Klant",
    "groupStyle": "ZIPPY_OPEN",
    "subParams": [
      {
        "type": "TEXT",
        "name": "privacyUrl",
        "displayName": "Privacy-URL",
        "simpleValueType": true,
        "valueValidators": [
          {
            "type": "NON_EMPTY"
          }
        ]
      },
      {
        "type": "SELECT",
        "name": "formal",
        "displayName": "Aanspreekvorm NL",
        "simpleValueType": true,
        "defaultValue": "je",
        "selectItems": [
          {
            "value": "je",
            "displayValue": "je"
          },
          {
            "value": "u",
            "displayValue": "u"
          }
        ]
      },
      {
        "type": "SELECT",
        "name": "fallbackLang",
        "displayName": "Terugvaltaal",
        "simpleValueType": true,
        "defaultValue": "en",
        "selectItems": [
          {
            "value": "en",
            "displayValue": "Engels"
          },
          {
            "value": "nl",
            "displayValue": "Nederlands"
          },
          {
            "value": "de",
            "displayValue": "Duits"
          },
          {
            "value": "fr",
            "displayValue": "Frans"
          }
        ]
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "grpStyle",
    "displayName": "Stijl (uit tokens.json van de klant)",
    "groupStyle": "ZIPPY_OPEN",
    "subParams": [
      {
        "type": "TEXT",
        "name": "accent",
        "displayName": "Accentkleur (#hex)",
        "simpleValueType": true,
        "defaultValue": "#2D6A4F"
      },
      {
        "type": "TEXT",
        "name": "bg",
        "displayName": "Achtergrond (#hex)",
        "simpleValueType": true,
        "defaultValue": "#FFFFFF"
      },
      {
        "type": "TEXT",
        "name": "text",
        "displayName": "Tekstkleur (#hex)",
        "simpleValueType": true,
        "defaultValue": "#1A1A1A"
      },
      {
        "type": "TEXT",
        "name": "radius",
        "displayName": "Afronding (px)",
        "simpleValueType": true,
        "defaultValue": "12"
      },
      {
        "type": "TEXT",
        "name": "font",
        "displayName": "Lettertype (leeg = van de site)",
        "simpleValueType": true,
        "defaultValue": ""
      },
      {
        "type": "SELECT",
        "name": "layout",
        "displayName": "Vorm",
        "simpleValueType": true,
        "defaultValue": "bar",
        "selectItems": [
          {
            "value": "bar",
            "displayValue": "Balk onderaan"
          },
          {
            "value": "card",
            "displayValue": "Kaart linksonder"
          },
          {
            "value": "modal",
            "displayValue": "Venster midden"
          }
        ]
      },
      {
        "type": "SELECT",
        "name": "weight",
        "displayName": "Knopgewicht",
        "simpleValueType": true,
        "defaultValue": "accept",
        "selectItems": [
          {
            "value": "accept",
            "displayValue": "Accepteren benadrukt (standaard)"
          },
          {
            "value": "equal",
            "displayValue": "Gelijkwaardig"
          }
        ]
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "grpBehaviour",
    "displayName": "Gedrag",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "regions",
        "displayName": "Regio's met default denied (ISO, komma's; leeg = overal)",
        "simpleValueType": true,
        "defaultValue": ""
      },
      {
        "type": "TEXT",
        "name": "waitForUpdate",
        "displayName": "wait_for_update (ms)",
        "simpleValueType": true,
        "defaultValue": "500"
      },
      {
        "type": "CHECKBOX",
        "name": "adsDataRedaction",
        "checkboxText": "Advertentiedata redigeren",
        "simpleValueType": true,
        "defaultValue": true
      },
      {
        "type": "TEXT",
        "name": "cookieDomain",
        "displayName": "Cookie-domein (bijv. .klant.nl)",
        "simpleValueType": true,
        "defaultValue": ""
      },
      {
        "type": "TEXT",
        "name": "expiresDays",
        "displayName": "Geldigheid keuze (dagen)",
        "simpleValueType": true,
        "defaultValue": "365"
      },
      {
        "type": "TEXT",
        "name": "revision",
        "displayName": "Revisie (ophogen = opnieuw vragen)",
        "simpleValueType": true,
        "defaultValue": "1",
        "valueValidators": [
          {
            "type": "POSITIVE_NUMBER"
          }
        ]
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "grpTech",
    "displayName": "Techniek",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "version",
        "displayName": "Scriptversie (1 of 1.2.3)",
        "simpleValueType": true,
        "defaultValue": "1"
      }
    ]
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

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


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "access_consent",
        "versionId": "1"
      },
      "param": [
        {
          "key": "consentTypes",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "ad_storage"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "ad_user_data"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "ad_personalization"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "analytics_storage"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "functionality_storage"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "consentType"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "security_storage"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "get_cookies",
        "versionId": "1"
      },
      "param": [
        {
          "key": "cookieAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "cookieNames",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "om_consent"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@*"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_globals",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keys",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "key"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  },
                  {
                    "type": 1,
                    "string": "execute"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "omConsentConfig"
                  },
                  {
                    "type": 8,
                    "boolean": false
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": false
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "write_data_layer",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keyPatterns",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "ads_data_redaction"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]


___TESTS___

scenarios:
- name: Default denied, script injected
  code: |-
    mock('getCookieValues', function () { return []; });
    runCode(mockData);
    assertApi('setDefaultConsentState').wasCalled();
    assertApi('updateConsentState').wasNotCalled();
    assertApi('injectScript').wasCalled();
    assertApi('gtmOnSuccess').wasCalled();
- name: Stored choice restored
  code: |-
    mock('getCookieValues', function () { return ['r1.a1.m0']; });
    runCode(mockData);
    assertApi('updateConsentState').wasCalledWith({ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'});
- name: Malformed cookie ignored
  code: |-
    mock('getCookieValues', function () { return ['r1.a2.m0']; });
    runCode(mockData);
    assertApi('updateConsentState').wasNotCalled();
setup: |-
  const mockData = {privacyUrl: 'https://example.com/privacy', revision: '1', waitForUpdate: '500', version: '1', adsDataRedaction: true};
  mock('injectScript', function (url, onSuccess) { onSuccess(); });


___NOTES___

Built by scripts/build-template.mjs — edit the sources in template/, not this file.


