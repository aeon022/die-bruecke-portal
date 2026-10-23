# Die Brücke Portal

Monorepo: `frontend/` (Astro 5, SSR via `@astrojs/node` standalone, Tailwind) und `backend/` (Directus + Postgres, Docker). Architektur und Stack: siehe `README.md`.

- Live: https://diebruecke.social, API/CMS: https://api.diebruecke.social
- Frontend-Container: `bruecke_beta` (`frontend/docker-compose.yml`), Port 4321
- Dev: `cd frontend && npm run dev` (Port 4321)
- `.env` liegt im Repo-Root (gitignored), `frontend/.env` ist ein Symlink darauf
- Formulare posten an `frontend/src/pages/api/*.ts` (JSON, Honeypot-Feld `website_check`, deutsche Fehlermeldungen)
- Rechtstexte (Datenschutz, Impressum) kommen aus Directus, nicht aus dem Code

## Newsletter (Brevo)

- Komponente `frontend/src/components/NewsletterForm.astro`: im Footer sowie auf `/contact` und `/events`. Neue Platzierung = Komponente einbinden, die Logik steckt in der Komponente.
- Route `frontend/src/pages/api/newsletter.ts` ruft Brevo `POST /v3/contacts/doubleOptinConfirmation` auf (Double-Opt-In). Der Kontakt landet erst nach Klick auf den Bestätigungslink in der Liste.
- Bestätigungsseite: `/newsletter-bestaetigt` (Ziel der Brevo-Weiterleitung)
- Env (Repo-Root-`.env` und Server-`.env`, durchgereicht in `frontend/docker-compose.yml`): `BREVO_API_KEY`, `BREVO_LIST_ID` (3 = Liste „Interessenten"), `BREVO_DOI_TEMPLATE_ID` (42 = eigenes DOI-Template mit „du“), `BREVO_DOI_REDIRECT_URL`, optional `BREVO_GEWINNSPIEL_LIST_ID` (Zusatzliste für Anmeldungen über `/gewinnspiel`; leer = keine Markierung)
- Brevo blockt API-Aufrufe von nicht freigegebenen IPs (https://app.brevo.com/security/authorised_ips). Lokal und Server-IP müssen freigegeben sein. Der Key hat keine Rechte auf Templates/Sender.
- Kein Google reCAPTCHA (Datenschutz): Spam-Schutz nur über Honeypot.
- Keine Secrets in Code, Commits oder Chat. Beim Wechsel des Keys nur `.env` ändern und den Container neu bauen.
