# OnestoMedia Consent

Consentbanner voor OnestoMedia-klanten: GTM-template (Consent Mode v2, advanced) + één script via jsDelivr.
Spec: agency-os `docs/superpowers/specs/2026-09-28-consent-banner-design.md`.

## Installeren bij een klant
1. GTM → Sjablonen → Nieuw → ⋮ → Importeren → `template/om-consent.tpl`.
2. Tag "OnestoMedia Consent" op trigger *Consent Initialization – All Pages*; velden invullen (privacy-URL verplicht).
3. Oude banner uitzetten. Niet-Google-tags: "aanvullende toestemming vereist" (Meta → ad_storage, PostHog → analytics_storage).
4. Publiceren na akkoord, daarna `npm run e2e:live -- --url https://<site>`.

## Release
`npm test && npm run build && npm run build:template`, commit `dist/` + `template/om-consent.tpl`, `npm version <patch|minor|major>`, push met tags, dan jsDelivr purgen (zie Task 9 van het plan).
