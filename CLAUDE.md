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
- Directus-Flow „Auto Generate Slug“ hängt das Jahr aus dem Eintrag an (Events: `start_date`), sonst das aktuelle Jahr. Vorhandene Slugs werden nie überschrieben (verschickte Links) – daher heißt z. B. Rock the Dog 06.02.2027 weiter `rock-the-dog-2026`.

## Einfache Sprache

- Umschalter im Barrierefreiheits-Menü (Rollstuhl-Button öffnet die Command Palette, `#cp-toggle-leicht` an erster Stelle); Logik in `layout.astro` (`window.toggleLeicht`, localStorage `leicht-lesen`, Attribut `data-ll` am `<html>`).
- Inhalte: `<Einfach title="…">…</Einfach>` (`components/Einfach.astro`, nur bei aktivem Schalter sichtbar), normaler Inhalt in `<div class="hide-on-ll">`. Seite mit `<MainLayout leicht>` markieren, sonst zeigt das Layout den Hinweis „noch nicht in einfacher Sprache“.
- Vorhanden: Startseite, Über uns, Kontakt, Zeitung (Texte nach der Zeitung in einfacher Sprache; Prüfung durch Klient:innen offen).
- Später: Felder `*_leicht` in Directus für CMS-Texte (wie kuin-at `ProseSwap`).
- Barrierefreiheit (Stand 04.11.2026, Gerwin): ebenerdiger Zugang/Rampe, rollstuhlgerechtes WC (kein Euro-Key), Parkplatz am Areal, breite Türen. Eigene Seite „Barrierefrei zu uns“ später (Öffis, Begleitperson, Sitzplätze offen).

## Mitgliedsformular → Mitglieder-App (04.11.2026, lokal)
- `api/membership.ts` schickt jede Anmeldung zusätzlich an die Mitglieder-App (`MEMBERS_API_URL`, Standard internal.diebruecke.social; `MEMBERS_API_KEY` = `AGENT_API_KEY` der App, nur in `.env`/Server). Fehler dort blockieren die Anmeldung nicht.
- Stripe-Weiterleitung nutzt den Link aus der App (mit `client_reference_id` = Lfd. Nr.) → Zahlung wird automatisch zugeordnet und aktiv geschaltet.
- Formular bleibt nach erfolgreicher Überweisungs-Anmeldung gesperrt (früher Ursache der Mehrfach-Anfragen).
- Directus `inbox_memberships` + Eingangsbestätigung laufen vorerst weiter; abschalten, sobald die App die Mails automatisch schickt.

## Serien (08.11.2026)
- Directus-Sammlung `event_series` (name, slug, color, sort, description), Feld `events.series` (M2O). Öffentlich lesbar.
- `/events`: zweite Filterzeile „Serien“ (nur Serien mit Terminen, Reihenfolge `sort`, Farbpunkt), kombinierbar mit Kategorie; Filter steht in der Adresse (`?kategorie=…&serie=…`).
- `/serien` (Übersicht) und `/serien/<slug>` (Beschreibung, nächste Termine, Rückblick). Abo-Kalender: `/serien/<slug>.ics`, ganzes Programm `/events.ics` (`lib/ics.ts`).
- Etikett/Ersatzbild in Serienfarbe: `components/events/` (SeriesBadge, EventImage, EventMiniCard), Farben `lib/series.ts`. Wiederholungen zentral in `lib/recurrence.ts`.
- `getEvents()` lädt nur kommende bzw. laufende Events (`includePast: true` für alle). Directus-Abfragen in `lib/api.ts` haben 60 s Zwischenspeicher (nur PROD).
- Kalender: Monatsüberschriften, Schnellfilter „Heute“/„Diese Woche“ (nächste 7 Tage, `?zeit=heute|woche`). Startseite: Streifen „Diese Woche“ (`components/home/WeekStrip.astro`) unter dem Event-Raster neben „Alle Veranstaltungen“.
- Bilder über 6000 px verkleinert Directus nicht (Transform-Fehler 400, Bild fehlt auf der Startseite) → vor dem Hochladen auf ca. 3000 px verkleinern. 08.11.2026: Crossing-Strings-Foto ersetzt (Original in `~/Sites/brücke-backups/directus-flows/`).
- Event-Texte: `lib/cleanHtml.ts` entfernt Word-Reste beim Anzeigen; der Flow „Event-Prüfung“ bereinigt `description` schon beim Speichern (am 08.11.2026 alle 51 betroffenen Texte einmalig bereinigt, Sicherung in `~/Sites/brücke-backups/directus-flows/`).
- Einfache Sprache je Event: Feld `events.description_leicht`; ist es befüllt, zeigt die Detailseite den Text bei eingeschalteter einfacher Sprache statt der Beschreibung.
- Detailseite am Handy: feste Leiste mit Datum und Tickets; Ort mit Adresse und Route-Link. Zeiten: „Bar & Buffet ab … · Saal ab …“ + „Freie Platzwahl“ (Regel in Büro/AGENTS.md, 08.11.2026).
- Dunkelmodus: `.series-surface` (Serienfarben gedämpft), `.event-thumb` (Bilder leicht abgedunkelt) in `styles/global.css`.
- Zuordnungsregel: Vault `Serien 2027/01 Serienvorschläge 2027.md` (Ergänzung 08.11.2026).

## Directus-Flow „Event-Prüfung“ (08.11.2026)
- Blockierend vor dem Speichern von `events`: Veröffentlichen ohne Bild oder Beginn wird abgelehnt (Fehlermeldung im Editor); leere Serie wird nach Titel vorgeschlagen (Mord vor Ort, Stammtisch, Iris hört zu, Murwärts, Kabarett Cuvée, Seriennamen). Code: `backend/flows/event-check.js` (bei Änderungen in Directus und hier gleich halten).
- Flow „pretix → Restkarten“ (Zeitplan alle 15 Min.) ruft je kommendem veröffentlichtem Event mit `pretix_slug` den Flow „pretix → Restkarten (pro Event)“ auf: pretix-Kontingent (`with_availability`) → `events.tickets_left` (ohne Events auszulösen). Website: Karten-Etikett „Nur noch X Karten“ und Detailseite „Noch X Tickets verfügbar“ erst ab 30 Restkarten.
- 08.11.2026 gelöscht: alter Flow „Pretix Sync v2“ (Sicherung in `~/Sites/brücke-backups/directus-flows/`, enthält Token – nicht weitergeben) und eine verwaiste Marketplace-Erweiterung ohne Dateien (nirgends verwendet).
- Achtung: Die pretix-Flows haben den API-Token im Klartext in den Request-Headern → Token erneuern und über `{{ $env.… }}` (FLOWS_ENV_ALLOW_LIST) einbinden.

## Deploy
- Kein Auto-Deploy aktiv. Am Server (m11, Benutzer `sysuser_1`, Repo `~/portal`): `~/portal/scripts/deploy.sh` (pull + `docker compose up -d --build` + Prüfung).
- Vorbereitet: `.github/workflows/deploy.yml`, läuft erst mit Repo-Variable `DEPLOY_ENABLED=true` und Secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`.
- Container läuft mit `TZ=Europe/Vienna` (Directus-Zeiten sind Wiener Ortszeit ohne Zone; ohne TZ waren Kalender-Links 1 h daneben).
