# OnestoMedia Consent

Consentbanner voor OnestoMedia-klanten: GTM-template (Consent Mode v2, advanced) + één script via jsDelivr.
Spec: agency-os `docs/superpowers/specs/2026-09-28-consent-banner-design.md`.

## Installeren bij een klant
1. GTM → Sjablonen → Nieuw → ⋮ → Importeren → `template/om-consent.tpl`.
2. Tag "OnestoMedia Consent" op trigger *Consent Initialization – All Pages*; velden invullen (privacy-URL verplicht).
3. Oude banner uitzetten. Niet-Google-tags: "aanvullende toestemming vereist" (Meta → ad_storage, PostHog → analytics_storage).
4. Publiceren na akkoord, daarna live controleren: `LIVE_URL=https://<site> npm run e2e:live`.
   Werkt alleen als déze banner op de site staat (de test klikt op `#cc-main`-knoppen van CookieConsent).

## Release
Versie eerst ophogen, dán bouwen: zo dragen `dist/` en `omConsent.version` het nieuwe nummer.

```sh
# 1. versie ophogen (nog geen tag; die zetten we na de build-commit)
npm version <x.y.z> --no-git-tag-version

# 2. bouwen en testen met het nieuwe versienummer
npm run build && npm run build:template && npm test && npm run e2e

# 3. release-commit
git add package.json package-lock.json dist/om-consent.min.js template/om-consent.tpl
git commit -m "release: v<x.y.z>"

# 4. tag en pushen (main + tags) met de OnestoMedia-credentials
git tag v<x.y.z>
git -c credential.helper= -c 'credential.helper=!f() { echo username=x-access-token; echo "password=$(gh auth token --user OnestoMedia)"; }; f' push origin main --tags

# 5. jsDelivr purgen en controleren
curl -s https://purge.jsdelivr.net/gh/OnestoMedia/consent-banner@1/dist/om-consent.min.js
curl -sI https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@1/dist/om-consent.min.js | head -1      # HTTP/2 200
curl -s  https://cdn.jsdelivr.net/gh/OnestoMedia/consent-banner@1/dist/om-consent.min.js | head -c 80   # "/*! OnestoMedia Consent v<x.y.z> ..."
```

`dist/` wordt alleen in de release-commit meegenomen, nooit in gewone feature-commits.
