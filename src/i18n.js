export const SUPPORTED = ['nl', 'en', 'de', 'fr'];

const TEXTS = {
  nl: {
    title: 'Cookies op deze site',
    description: {
      je: 'We gebruiken noodzakelijke cookies om de site te laten werken. Met jouw toestemming gebruiken we ook analytische cookies om de site te verbeteren en marketingcookies om advertenties relevanter te maken. Je kunt je keuze altijd aanpassen via Cookie-instellingen.',
      u: 'We gebruiken noodzakelijke cookies om de site te laten werken. Met uw toestemming gebruiken we ook analytische cookies om de site te verbeteren en marketingcookies om advertenties relevanter te maken. U kunt uw keuze altijd aanpassen via Cookie-instellingen.',
    },
    accept: 'Alles accepteren', reject: 'Alles weigeren', settings: 'Instellingen', save: 'Keuze opslaan',
    privacy: 'Privacyverklaring', close: 'Sluiten',
    prefsTitle: 'Cookie-instellingen',
    prefsIntro: {
      je: 'Kies welke cookies je toestaat. Noodzakelijke cookies staan altijd aan.',
      u: 'Kies welke cookies u toestaat. Noodzakelijke cookies staan altijd aan.',
    },
    cats: [
      ['Noodzakelijk', 'Zorgen dat de site werkt: winkelwagen, inloggen en beveiliging.'],
      ['Analytisch', 'Laten zien hoe bezoekers de site gebruiken, zodat we hem kunnen verbeteren. Bijvoorbeeld Google Analytics en PostHog.'],
      ['Marketing', 'Maken advertenties relevanter en meten wat ze opleveren. Bijvoorbeeld Google Ads en Meta.'],
    ],
  },
  en: {
    title: 'Cookies on this site',
    description: 'We use necessary cookies to make this site work. With your consent, we also use analytics cookies to improve the site and marketing cookies to make ads more relevant. You can change your choice at any time in Cookie settings.',
    accept: 'Accept all', reject: 'Reject all', settings: 'Settings', save: 'Save choices',
    privacy: 'Privacy policy', close: 'Close',
    prefsTitle: 'Cookie settings',
    prefsIntro: 'Choose which cookies you allow. Necessary cookies are always on.',
    cats: [
      ['Necessary', 'Keep the site working: shopping cart, login and security.'],
      ['Analytics', 'Show how visitors use the site so we can improve it. For example Google Analytics and PostHog.'],
      ['Marketing', 'Make ads more relevant and measure their results. For example Google Ads and Meta.'],
    ],
  },
  de: {
    title: 'Cookies auf dieser Website',
    description: 'Wir verwenden notwendige Cookies, damit die Website funktioniert. Mit Ihrer Einwilligung verwenden wir außerdem Analyse-Cookies, um die Website zu verbessern, und Marketing-Cookies, um Werbung relevanter zu machen. Sie können Ihre Auswahl jederzeit in den Cookie-Einstellungen ändern.',
    accept: 'Alle akzeptieren', reject: 'Alle ablehnen', settings: 'Einstellungen', save: 'Auswahl speichern',
    privacy: 'Datenschutzerklärung', close: 'Schließen',
    prefsTitle: 'Cookie-Einstellungen',
    prefsIntro: 'Wählen Sie, welche Cookies Sie zulassen. Notwendige Cookies sind immer aktiv.',
    cats: [
      ['Notwendig', 'Sorgen dafür, dass die Website funktioniert: Warenkorb, Anmeldung und Sicherheit.'],
      ['Analyse', 'Zeigen, wie Besucher die Website nutzen, damit wir sie verbessern können. Zum Beispiel Google Analytics und PostHog.'],
      ['Marketing', 'Machen Werbung relevanter und messen ihre Ergebnisse. Zum Beispiel Google Ads und Meta.'],
    ],
  },
  fr: {
    title: 'Cookies sur ce site',
    description: "Nous utilisons des cookies nécessaires au fonctionnement du site. Avec votre accord, nous utilisons aussi des cookies analytiques pour améliorer le site et des cookies marketing pour rendre les publicités plus pertinentes. Vous pouvez modifier votre choix à tout moment dans les paramètres des cookies.",
    accept: 'Tout accepter', reject: 'Tout refuser', settings: 'Paramètres', save: 'Enregistrer mes choix',
    privacy: 'Politique de confidentialité', close: 'Fermer',
    prefsTitle: 'Paramètres des cookies',
    prefsIntro: 'Choisissez les cookies que vous autorisez. Les cookies nécessaires sont toujours actifs.',
    cats: [
      ['Nécessaires', 'Font fonctionner le site : panier, connexion et sécurité.'],
      ['Analytiques', "Montrent comment les visiteurs utilisent le site pour que nous puissions l'améliorer. Par exemple Google Analytics et PostHog."],
      ['Marketing', 'Rendent les publicités plus pertinentes et mesurent leurs résultats. Par exemple Google Ads et Meta.'],
    ],
  },
};

const CATEGORY_KEYS = ['necessary', 'analytics', 'marketing'];

export function pickLanguage(htmlLang, fallback) {
  const primary = String(htmlLang || '').toLowerCase().split(/[-_]/)[0];
  if (SUPPORTED.includes(primary)) return primary;
  return SUPPORTED.includes(fallback) ? fallback : 'en';
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const pick = (v, formal) => (typeof v === 'string' ? v : v[formal] || v.je);

export function buildTranslation(lang, formal, privacyUrl) {
  const L = TEXTS[lang] || TEXTS.en;
  const link = privacyUrl
    ? `<a href="${escapeAttr(privacyUrl)}" target="_blank" rel="noopener">${L.privacy}</a>`
    : '';
  return {
    consentModal: {
      title: L.title,
      description: pick(L.description, formal),
      acceptAllBtn: L.accept,
      acceptNecessaryBtn: L.reject,
      showPreferencesBtn: L.settings,
      closeIconLabel: L.close,
      footer: link,
    },
    preferencesModal: {
      title: L.prefsTitle,
      acceptAllBtn: L.accept,
      acceptNecessaryBtn: L.reject,
      savePreferencesBtn: L.save,
      closeIconLabel: L.close,
      sections: [
        { description: `${pick(L.prefsIntro, formal)}${link ? ' ' + link : ''}` },
        ...L.cats.map(([title, description], i) => ({ title, description, linkedCategory: CATEGORY_KEYS[i] })),
      ],
    },
  };
}
