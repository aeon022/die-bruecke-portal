# Die Brücke Portal

Monorepo: `frontend/` (Astro 5, SSR via `@astrojs/node` standalone, Tailwind) und `backend/` (Directus + Postgres, Docker). Architektur und Stack: siehe `README.md`.

- Live: https://diebruecke.social, API/CMS: https://api.diebruecke.social
- Frontend-Container: `bruecke_beta` (`frontend/docker-compose.yml`), Port 4321
- Dev: `cd frontend && npm run dev` (Port 4321)
- `.env` liegt im Repo-Root (gitignored), `frontend/.env` ist ein Symlink darauf
- Formulare posten an `frontend/src/pages/api/*.ts` (JSON, Honeypot-Feld `website_check`, deutsche Fehlermeldungen). Kontakt und Mitgliedschaft schreiben über `directusForms` (`src/lib/directus.ts`) mit `DIRECTUS_FORM_TOKEN` in `inbox`/`inbox_memberships`; ohne Token öffentlicher Zugriff (Fallback)
- Sicherheits-Header setzt `frontend/src/middleware.ts`
- Rechtstexte (Datenschutz, Impressum) kommen aus Directus, nicht aus dem Code

## Newsletter (Brevo)

- Komponente `frontend/src/components/NewsletterForm.astro`: im Footer sowie auf `/contact` und `/events`. Neue Platzierung = Komponente einbinden, die Logik steckt in der Komponente.
- Route `frontend/src/pages/api/newsletter.ts` ruft Brevo `POST /v3/contacts/doubleOptinConfirmation` auf (Double-Opt-In). Der Kontakt landet erst nach Klick auf den Bestätigungslink in der Liste.
- Bestätigungsseite: `/newsletter-bestaetigt` (Ziel der Brevo-Weiterleitung)
- Env (Repo-Root-`.env` und Server-`.env`, durchgereicht in `frontend/docker-compose.yml`): `BREVO_API_KEY`, `BREVO_LIST_ID` (3 = Liste „Interessenten"), `BREVO_DOI_TEMPLATE_ID` (42 = eigenes DOI-Template mit „du“), `BREVO_DOI_REDIRECT_URL`, optional `BREVO_GEWINNSPIEL_LIST_ID` (Zusatzliste für Anmeldungen über `/gewinnspiel`; leer = keine Markierung)
- Brevo blockt API-Aufrufe von nicht freigegebenen IPs (https://app.brevo.com/security/authorised_ips). Lokal und Server-IP müssen freigegeben sein. Der Key hat keine Rechte auf Templates/Sender.
- Kein Google reCAPTCHA (Datenschutz): Spam-Schutz nur über Honeypot.
- Keine Secrets in Code, Commits oder Chat. Beim Wechsel des Keys nur `.env` ändern und den Container neu bauen.

## Directus-Zugang für Claude

- Konto für Inhaltspflege (Rolle Administrator): `DIRECTUS_AGENT_EMAIL` / `DIRECTUS_AGENT_PASSWORD` in der Repo-Root-`.env` (gitignored). Login per `POST /auth/login`, Token nur im Speicher halten.

## Zeitung

- Seite `/zeitung` (`frontend/src/pages/zeitung.astro`), PDFs und Titelbilder in `frontend/public/zeitung/`. Neue Ausgabe: Dateien tauschen, Werte oben in der Seite anpassen. Verlinkt in Footer, Command Palette und `/about`.
- Directus-Flow „Auto Generate Slug“ hängt beim Anlegen das aktuelle Jahr an den Slug (z. B. Archiv `jahresbericht-2025-2026`, angelegt 04.11.2026). Bei Archiv-Einträgen mit Jahr im Titel unschön, aber funktional.

## Einfache Sprache

- Umschalter im Header (`#btnLeicht`) und in der Command Palette; Logik in `layout.astro` (`window.toggleLeicht`, localStorage `leicht-lesen`, Attribut `data-ll` am `<html>`).
- Inhalte: `<Einfach title="…">…</Einfach>` (`components/Einfach.astro`, nur bei aktivem Schalter sichtbar), normaler Inhalt in `<div class="hide-on-ll">`. Seite mit `<MainLayout leicht>` markieren, sonst zeigt das Layout den Hinweis „noch nicht in einfacher Sprache“.
- Vorhanden: Startseite, Über uns, Kontakt, Zeitung (Texte nach der Zeitung in einfacher Sprache; Prüfung durch Klient:innen offen).
- Später: Felder `*_leicht` in Directus für CMS-Texte (wie kuin-at `ProseSwap`).
